#!/bin/bash

if [[ -z ${AWS_S3_BUCKET} || -z ${AWS_S3_FOLDER} ]]; then
  echo 'Must speciy environment variables: AWS_S3_BUCKET, AWS_S3_FOLDER'
  echo "AWS_S3_BUCKET: ${AWS_S3_BUCKET}"
  echo "AWS_S3_FOLDER: ${AWS_S3_FOLDER}"
  echo 'Deployment skipped'
  exit 1
fi

aws s3 sync "public/" "s3://${AWS_S3_BUCKET}/${AWS_S3_FOLDER}/"
