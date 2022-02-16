#!/bin/bash

if [[ -z ${AWS_CF_DIST_ID} ]]; then
  echo 'Must speciy environment variables: AWS_CF_DIST_ID'
  echo "AWS_CF_DIST_ID: ${AWS_CF_DIST_ID}"
  echo 'Invalidate skipped'
  exit 1
fi

aws cloudfront create-invalidation --distribution-id ${AWS_CF_DIST_ID} --paths "/*"
