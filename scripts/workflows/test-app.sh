#!/bin/bash

cp ./config.example.toml ./config.toml
# We need to change the type to local to avoid the iCloud sync issue in CI.
sed -i '' 's/type = "icloud"/type = "local"/g' ./config.toml


MAX_RETRIES=20
RETRY=0

(./raycast-unblock-app &)

do_request() {
  curl -f -m 10 http://127.0.0.1:3000
}

do_request

while [[ $? -ne 0 ]] && [[ $RETRY -lt $MAX_RETRIES ]]; do
  sleep 5
  ((RETRY++))
  echo -e "RETRY: ${RETRY}\n"
  do_request
done
request_exit_code=$?

echo -e "\nrequest code: ${request_exit_code}\n"

if [ $RETRY -gt $MAX_RETRIES ]; then
  echo -n "Unable to run, aborted"
  kill -9 $p
  exit 1

elif [ $request_exit_code -ne 0 ]; then
  echo -n "Request error"
  kill -9 $p
  exit 1

else
  echo -e "\nSuccessfully acquire index, passing"
  kill -9 $p
  exit 0
fi