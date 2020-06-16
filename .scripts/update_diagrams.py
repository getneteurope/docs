#!/usr/bin/env python3

import sys
import os

import requests
import shutil

from argparse import ArgumentParser
from pathlib import Path
from termcolor import colored
from zipfile import ZipFile

DOWNLOAD_DIR = Path('/tmp/docs-diagrams')
ZIP = DOWNLOAD_DIR / 'docs-diagrams-master.zip'

TOKEN_CACHE = Path.home() / '.tecdoc' / 'ght'

GITHUB_TOKEN = None
GITHUB_REPO  = 'wirecard/docs-diagrams'
GITHUB_URL   = 'https://github.com'
GITHUB_API   = 'https://api.github.com'

def _error(msg):
    print(colored(msg, 'red'), file=sys.stderr)

def cprint(msg, color, indent=0):
    print(f"{' ' * indent}{colored(msg, color)}")

def _get(url, params=None, stream=False):
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3.raw'
    }
    response = requests.get(url=url, headers=headers, params=params,
                            stream=stream)
    return response

def _download(url, outfile):
    r = _get(url, stream=True)
    with open(outfile, 'wb') as fd:
        for chunk in r.iter_content(chunk_size=1024):
            fd.write(chunk)

def _unpack(zipfile):
    with ZipFile(zipfile, 'r') as zip_ref:
        zip_ref.extractall(DOWNLOAD_DIR)
        os.remove(zipfile)

def checks():
    """
    Perform sanity checks.
    Check whether the Github token is available and prepare the download directory.
    :return: None
    """
    cprint('Running sanity checks...', 'blue')
    global GITHUB_TOKEN
    # check download dir
    if DOWNLOAD_DIR.exists():
        shutil.rmtree(DOWNLOAD_DIR)
        DOWNLOAD_DIR.mkdir()

    # Github token
    GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
    if GITHUB_TOKEN is None:
        if TOKEN_CACHE.exists():
            with open(TOKEN_CACHE, 'r') as cache_file:
                GITHUB_TOKEN = cache_file.read()
        else:
            _error('Could not find Github Token!')
            _error('Please set $GITHUB_TOKEN in your environment.')
            _error('Follow-up runs will cache this token under $TOKEN_CACHE')
            raise Exception('token not found in $GITHUB_TOKEN and not cached')
    else:
        with open(TOKEN_CACHE, 'w+') as cache_file:
            cache_file.write(GITHUB_TOKEN)


def parse_args():
    """
    Parse command line arguments.
    :return: parsed arguments
    """
    arg_parser = ArgumentParser()
    arg_parser.add_argument('--branch', '-b', default='master',
                            help='Specify the source branch of the zip artifact (default: master)')
    arg_parser.add_argument('--dry-run', default=False, action='store_true',
                            help='only print the changes which would be applied, do not move any files')
    return arg_parser.parse_args()

def fetch(workflow_name='CI', branch='master', artifact_name='diagrams'):
    # workflow
    cprint(f"Fetching workflow with name '{workflow_name}'", 'blue')
    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/actions/workflows"
    resp = _get(url)
    workflows = resp.json()['workflows']
    idx = [w['name'] for w in workflows].index('CI')
    workflow_id = workflows[idx]['id']
    cprint(f"id: {workflow_id}", 'blue', indent=4)

    # workflow run
    cprint(f"Fetch last successful run on branch '{branch}'", 'blue')
    params = {
        'branch': branch,
        'status': 'success'
    }
    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/actions/workflows/{workflow_id}/runs"
    resp = _get(url, params=params)
    last_run = resp.json()['workflow_runs'][0]
    run_id = last_run['id']
    artifacts_url = last_run['artifacts_url']
    cprint(f"id: {run_id}", 'blue', indent=4)

    # artifacts
    cprint('Fetching artifact', 'blue')
    url = artifacts_url
    resp = _get(url)
    artifacts = resp.json()['artifacts']
    idx = [a['name'] for a in artifacts].index(artifact_name)
    artifact_id = artifacts[idx]['id']
    download_url = artifacts[idx]['archive_download_url']
    cprint(f'name: {artifact_name}', 'blue', indent=4)

    # download artifact
    cprint('Downloading', 'blue')
    cprint(f'url: {download_url}', 'blue', indent=4)
    cprint(f'out: {ZIP}', 'blue', indent=4)
    _download(download_url, ZIP)
    cprint('Unpacking', 'blue')
    _unpack(ZIP)

def update(old_path = Path.cwd() / 'content' / 'images',
           new_path = DOWNLOAD_DIR,
           dry_run=False):
    cprint('Parse names.txt', 'blue')
    names_txt = DOWNLOAD_DIR / 'names.txt'
    lines = None
    with open(names_txt) as names_file:
        lines = [line.rstrip() for line in names_file.readlines()]

    # create a base mapping of old -> new
    basename_map = {}
    for line in lines:
        old, new = line.split(':')
        basename_map[old] = new

    move_map = {}
    # get old paths and remove the extension
    old_pngs = set([str(png)[:-4]
                    for png in old_path.rglob('*.png')])
    old_svgs = set([str(svg)[:-4]
                    for svg in old_path.rglob('*.svg')])
    old_basenames = old_pngs.union(old_svgs)
    cprint('found {} files to replace'.format(len(old_basenames)), 'blue', indent=4)
    # iterate over name map (old -> new)
    for old_name, new_name in basename_map.items():
        # iterate over old basenames (without extension)
        for old_basename in old_basenames:
            # check for a filename match
            if old_basename.endswith(old_name):
                # fill move_map with the appropriate operation
                # e.g.:
                # new.png -> old.png
                # new.svg -> old.svg
                move_map[old_name] = []
                for ext in ".png .svg".split():
                    new_file_path = new_path / (new_name + ext)
                    old_file_path = old_basename + ext
                    move_map[old_name].append({ new_file_path: old_file_path })

    if dry_run:
        import pprint
        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(move_map)
        cprint('No changes were applied (--dry-run).', 'green')
        sys.exit(0)

    # run the actual replace
    cprint('Replace', 'blue')
    for basename, old_new_pairs in move_map:
        cprint(basename, 'yellow')
        for old, new in old_new_pairs:
            shutil.copy(new, old)


def main():
    checks()
    args = parse_args()
    fetch(branch=args.branch)
    update(dry_run=args.dry_run)

if __name__ == "__main__":
    main()
