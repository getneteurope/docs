# Scripts

## `deploy.sh`
Script that is used to actually deploy the HTML documentation using AWS CLI (by default).

Uses the environment variables
* `AWS_S3_BUCKET`
* `AWS_S3_FOLDER`
to deploy to an S3 instance, credentials are supplied via Github Secrets and environment variables.

## `extract_build_name.sh`
Extract the build name, either a branch name, tag name or pull request number.
References the Github Actions environment variables `GITHUB_REF`.

## `get_vale_styles.sh`
Download the default Vale styles from the official errata-ai repository.
Needed for Vale to create a baseline of rules.

## **DEPRECATED** `update_diagrams.sh`
Update all diagrams with the latest `artifacts.zip` from [wirecard/docs-diagrams](https://github.com/wirecard/docs-diagrams).
This zip contains all PDF and SVG artifacts plus a `names.txt` which is the filename mapping from old diagram filename to new diagram filename.


## `update_diagrams.py`
Update all diagrams with the latest `artifacts.zip` from [wirecard/docs-diagrams](https://github.com/wirecard/docs-diagrams).
This zip contains all PDF and SVG artifacts plus a `names.txt` which is the filename mapping from old diagram filename to new diagram filename.

Python3 requirements:
* `requests`
* `termcolor`
