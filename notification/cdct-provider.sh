#!/bin/bash

# abort if any command fails
set -e

dir=$(dirname "$0")
cd ${dir}/..

# remove containers that already exist which may distort the initial state of the service
containersToRemove=( "rabbitmq" "notification-db" )
for containerName in ${containersToRemove[@]}
do
  containerIds=$(docker ps -a -q --filter name=$(basename $PWD)_$containerName)
  [[ -n $containerIds ]] && docker rm -f -v $containerIds
done

docker-compose -f docker-compose.yml -f docker-compose.provider.yml build notification notification-db rabbitmq
docker-compose -f docker-compose.yml -f docker-compose.provider.yml up --exit-code-from notification notification notification-db rabbitmq