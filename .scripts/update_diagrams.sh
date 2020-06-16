#!/bin/bash

set -eo pipefail

source "$(dirname $0)/utils.sh"

# Temp files
JSON="$(mktemp)"
TMPDIR="/tmp/docs-diagrams" # "$(mktemp -d)"
ZIP="$TMPDIR/docs-diagrams-master.zip"

# Token
TOKEN_CACHE="$HOME/.tecdoc/ght"

# Github
REPO="wirecard/docs-diagrams"
GITHUB_URL="https://github.com"
GITHUB_API="https://api.github.com"

gh_curl() {
    curl -H "Authorization: token $GITHUB_TOKEN" \
         -H "Accept: application/vnd.github.v3.raw" \
         $@
}

# Main
_check() {
    _log blue bold "Running sanity checks..."
    # make sure TMPDIR is present and empty
    rm -rf "$TMPDIR"
    mkdir -p "$TMPDIR"
    # jq must be installed
    if ! command -v jq >/dev/null; then
        _log red bold "jq is required but not installed."
        echo "https://stedolan.github.io/jq/"
        exit 1
    fi

    # Check whether TOKEN_CACHE folder has been created.
    TOKEN_CACHE_DIR="$(dirname $TOKEN_CACHE)"
    if [[ ! -d $TOKEN_CACHE_DIR ]]; then
        mkdir -p "$TOKEN_CACHE_DIR"
    fi

    # Check whether $GITHUB_TOKEN is set.
    # Otherwise, either parse the token from $TOKEN_CACHE or exit with error.
    if [[ -z $GITHUB_TOKEN ]] && [[ ! -f $TOKEN_CACHE ]]; then
        _log red bold "Could not find Github Token!"
        _log red 'Please set $GITHUB_TOKEN in your environment.'
        _log red "Follow-up runs will cache this token under $TOKEN_CACHE"
        exit 1
    fi

    # Either GITHUB_TOKEN was provided or TOKEN_CACHE exists
    if [[ -z $GITHUB_TOKEN ]]; then
        GITHUB_TOKEN="$(cat $TOKEN_CACHE)"
    else
        echo "$GITHUB_TOKEN" > "$TOKEN_CACHE"
    fi
}

_parse_args() {
    while [[ "$#" -gt 0 ]]; do
        case "$1" in
            --branch)
                ARG_BRANCH="$2"
                shift
                ;;
            *)
                _log red bold "Unknown argument: $1"
                exit 1
                ;;
        esac
        shift
    done
}

_fetch() {
    _log blue bold "Selecting workflow with name 'CI'..."

    # workflow ID
    gh_curl -s "${GITHUB_API}/repos/${REPO}/actions/workflows" >"$JSON"
    WORKFLOW_ID=$(jq '.workflows[] | select(.name == "CI") | .id' "$JSON")
    _log blue "    id: $WORKFLOW_ID"

    # workflow runs
    BRANCH="${ARG_BRANCH:-master}"
    _log blue bold "Selecting last successful run on branch '${BRANCH}'..."
    PARAMS="branch=${BRANCH}&status=success"
    gh_curl -s "${GITHUB_API}/repos/${REPO}/actions/workflows/${WORKFLOW_ID}/runs?${PARAMS}" >"$JSON"
    RUN_ID=$(jq -r '.workflow_runs[0].id' "$JSON")
    ARTIFACTS_URL=$(jq -r '.workflow_runs[0].artifacts_url' "$JSON")
    _log blue "    id: $RUN_ID"

    # artifacts
    _log blue bold "Fetching artifact..."
    gh_curl -s "$ARTIFACTS_URL" >"$JSON"
    NAME=$(jq -r '.artifacts[0].name' "$JSON")
    DOWNLOAD_URL=$(jq -r '.artifacts[] | select(.name == "diagrams") | .archive_download_url' "$JSON")
    _log blue "    name: $NAME"

    _log blue bold "Downloading artifact..."
    _log blue "    url: $DOWNLOAD_URL"
    _log blue "    out: $ZIP"

    gh_curl -s -L -o "$ZIP" "${DOWNLOAD_URL}"
}

_update() {
    # unzip
    _log blue bold "Unpacking artifact..."
    _log blue "    zip: $ZIP"
    ( cd "$TMPDIR" && unzip $(basename "$ZIP") ) >/dev/null
    # remove zip file after unpacking
    rm -rf "$ZIP"
    NAME_MAP="${TMPDIR}/names.txt"
    _log blue bold "Copy artifacts and update Asciidoc links..."
    # move files and update image links in asciidoc
    while read -r line; do
        old="$(echo $line | cut -d':' -f1)"
        new="$(echo $line | cut -d':' -f2)"
        _log yellow bold "${new} -> ${old}"
        # DEBUG
        for ext in png svg; do
            old_count="$(find content/images -type f -name "${old}.${ext}" | wc -l | tr -d ' ')"
            if (( old_count < 1 )); then
                _log red bold "[SKIP] Could not find file: ${old}.${ext}"
                continue
            elif (( old_count > 1 )); then
                _log red bold "[SKIP] Found ${old_count} occurences: ${old}.${ext}"
                continue
            fi
            old_path="$(find content/images -type f -name "${old}.${ext}")"
            new_path="$(find $TMPDIR -type f -name "${new}.${ext}")"
            echo "${new_path} -> ${old_path}"
        done
        # DEBUG END
    done < "$NAME_MAP"
}

_main() {
    _fetch
    _update
    _log green bold "DONE"
}

_log red bold "DEPRECATED"
exit 1

_log green bold "UPDATE DIAGRAMS"
_check
_parse_args $@
_main
