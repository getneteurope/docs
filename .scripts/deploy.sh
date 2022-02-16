#!/bin/bash

if [[ -z ${AWS_S3_BUCKET} || -z ${AWS_S3_FOLDER} || -z ${AWS_CF_DIST_ID} ]]; then
  echo 'Must speciy environment variables: AWS_S3_BUCKET, AWS_S3_FOLDER, AWS_CF_DIST_ID'
  echo "AWS_S3_BUCKET: ${AWS_S3_BUCKET}"
  echo "AWS_S3_FOLDER: ${AWS_S3_FOLDER}"
  echo "AWS_CF_DIST_ID: ${AWS_CF_DIST_ID}"
  echo 'Deployment skipped'
  exit 1
fi

aws s3 sync "public/" "s3://${AWS_S3_BUCKET}/${AWS_S3_FOLDER}/" --delete
aws cloudfront create-invalidation --distribution-id ${AWS_CF_DIST_ID} --paths "/*"
