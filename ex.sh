#!/usr/bin/env bash

if [ -f .env ]; then
  export $(cat .env | xargs)
fi

case "$1" in
db:connect)
  psql ${DATABASE_URL}
  ;;
db:backup)
  pg_dump ${DATABASE_URL} > db.backup
  ;;
ssh)
  shift
  SSH_PATH="$HOME/.ssh/$TF_VAR_ssh_key_name"
  if [[ -z $1 ]]; then
    echo -e "Usage: ./ex.sh ssh <ipv4>"
    exit 1
  fi
  if [ ! -f $SSH_PATH ]; then
    echo -e "\033[41mSSH key not found at: $SSH_PATH\033[0m"
    exit 1
  fi
  ssh -o "IdentitiesOnly=yes" -i $SSH_PATH ubuntu@$1
  ;;
tf)
  shift
  terraform -chdir=tf/prod $@ -var-file=.tfvars
  ;;
*)
  echo $"Usage: $0 tf <commands>"
  exit 1
  ;;
esac
