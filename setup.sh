#!/bin/bash

# colors
NC='\033[0m'              # No Color
Red='\033[0;31m'          # Red
Green='\033[0;32m'        # Green
Blue='\033[0;34m'         # Blue

function exit_with_message_and_error() {
    echo -e "${Red}An error occurred : $1. Exiting.${NC}"
    exit "$2"
}

function introduction() {
  echo "This installation script will set up the production environment for the cryptalbum project."

  echo "Checking for required software..."
  if ! command -v docker &> /dev/null
  then
      echo "Docker not found. Installing it..."
      wget -qO- https://get.docker.com | sh
  fi

  if ! command -v docker-compose &> /dev/null
  then
      echo "Docker Compose not found. Installing it..."
      sudo apt-get update
      sudo apt-get install -y docker-compose
  fi

  echo "Required software found."

  echo "Setting up the environment..."
}

function clean_env_files() {
    echo "Cleaning up environment files..."
    rm -f .env
    rm -f .minio.env
    rm -f .postgres.env
    echo "Environment files cleaned up."
}

function set_up_minio_env_vars() {
    echo "Setting up Minio environment variables..."

    echo "Enter the Minio username you want to use:"
    read -r MINIO_USERNAME
    while [ -z "$MINIO_USERNAME" ]
    do
        echo -e "${Red}Username cannot be empty.${NC}"
        echo "Enter the Minio username you want to use:"
        read -r MINIO_USERNAME
    done

    echo "Enter the Minio password you want to use:"
    read -r -s MINIO_PASSWORD
    while [ -z "$MINIO_PASSWORD" ]
    do
        echo -e "${Red}Password cannot be empty.${NC}"
        echo "Enter the Minio password you want to use:"
        read -r -s MINIO_PASSWORD
    done

    echo "MINIO_ROOT_USER=$MINIO_USERNAME" >> .minio.env
    echo "MINIO_ROOT_PASSWORD=$MINIO_PASSWORD" >> .minio.env

    echo "Minio environment variables set up."
}

function set_up_postgres_env_vars() {
    echo "Setting up Postgres environment variables..."
    echo "Enter the Postgres username you want to use (default: postgres):"
    read -r POSTGRES_USERNAME

    if [ -z "$POSTGRES_USERNAME" ]
    then
        POSTGRES_USERNAME="postgres"
    fi

    echo "Generating the Postgres password..."
    POSTGRES_PASSWORD=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 32)

    {
        echo "POSTGRES_USERNAME=$POSTGRES_USERNAME"
        echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
        echo "POSTGRES_DB=cryptalbum"
    } >> .postgres.env

    echo "DATABASE_URL=postgres://$POSTGRES_USERNAME:$POSTGRES_PASSWORD@172.17.0.1:5432/cryptalbum" >> .env

    echo "Postgres environment variables set up."
    #echo -e "Postgres username: ${Green}$POSTGRES_USERNAME${NC}"
    #echo -e "Postgres password: ${Green}$POSTGRES_PASSWORD${NC}"
}

function start_storage_services() {
    echo "Starting storage and database services..."
    sudo docker-compose -f docker-compose.storage.yml up -d
    echo "Storage services started."
}

function generate_next_auth_secrets() {
    echo "Generating NextAuth secret..."

    {
        echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
        echo "NEXTAUTH_URL=https://cryptalbum.local"
    } >> .env

    echo "Secret generated."
}

function save_minio_data_to_env() {
    echo "Please go to https://minio.local/access-keys and create a new access key."
    echo "Enter the Minio access key you created:"

    read -r -s MINIO_ACCESS_KEY
    while [ -z "$MINIO_ACCESS_KEY" ]
    do
        echo -e "${Red}Access key cannot be empty.${NC}"
        echo "Enter the Minio access key you created:"
        read -r -s MINIO_ACCESS_KEY
    done

    echo "Enter the Minio secret key you created:"
    read -r -s MINIO_SECRET_KEY
    while [ -z "$MINIO_SECRET_KEY" ]
    do
        echo -e "${Red}Secret key cannot be empty.${NC}"
        echo "Enter the Minio secret key you created:"
        read -r -s MINIO_SECRET_KEY
    done

    {
        echo "MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY"
        echo "MINIO_SECRET_KEY=$MINIO_SECRET_KEY"
        echo "MINIO_ENDPOINT=172.17.0.1"
        echo "MINIO_PORT=9000"
        echo "MINIO_BUCKET=cryptalbum"
        echo "MINIO_SECURE=false"
    } >> .env

    echo "Minio access and secret keys saved."
}

function save_seq_data_to_env() {
    echo "Please go to https://seq.local/#/settings/api-keys and create a new API key for the application."
    echo "Enter the Seq API key you created:"

    read -r -s SEQ_API_KEY
    while [ -z "$SEQ_API_KEY" ]
    do
        echo -e "${Red}API key cannot be empty.${NC}"
        echo "Enter the Seq API key you created:"
        read -r -s SEQ_API_KEY
    done

    {
        echo "SEQ_URL=http://172.17.0.1:5341"
        echo "SEQ_API_KEY=$SEQ_API_KEY"
        echo "SERVER_LOG_SECRET_KEY=$(openssl rand -base64 64 | tr -d '\n')"
    } >> .env

    echo "Seq API key saved."
}

function generate_certificate_for() {
    echo "Generating a certificate for $1..."
    printf "\n\n\n\n\n%s\n" "$1" | openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout nginx/certs/$1.key -out nginx/certs/$1.crt -config nginx/certs/cryptalbum.conf &> /dev/null
    echo "Certificate generated."
}

function trust_certificate() {
    echo "Registering the certificate as trusted..."
    certutil -d "sql:$HOME/.pki/nssdb" -A -t "P,," -n "localhost" -i "nginx/certs/$1.crt"
    echo "Certificate registered as trusted."
}

function generate_nginx_certificates() {
    echo "Generating server certificates and registering them as trusted..."

    generate_certificate_for "seq.local"
    generate_certificate_for "minio.local"
    generate_certificate_for "cryptalbum.local"

    if ! command -v certutil &> /dev/null
    then
        echo -e "certutil not found. ${Blue}Installing it...${NC}"

        if ! command -v apt-get &> /dev/null
        then
            exit_with_message_and_error "apt-get not found. Please install certutil manually." 2
        fi

        sudo apt-get install -y libnss3-tools
    fi

    trust_certificate "seq.local"
    trust_certificate "minio.local"
    trust_certificate "cryptalbum.local"

    echo "Certificates generated."
}

function start_app_container() {
    echo "Starting the application..."
    sudo docker-compose -f docker-compose.app.yml up -d --build
    echo "Application started."
}

function add_to_hosts() {
    echo "In order to use the application correctly, you need to add the following line to your hosts file:"
    echo -e "${Green}127.0.0.1 host.docker.internal${NC}"
    echo -e "${Green}127.0.0.1 seq.local${NC}"
    echo -e "${Green}127.0.0.1 minio.local${NC}"
    echo -e "${Green}127.0.0.1 cryptalbum.local${NC}"
    echo ""
    echo "Do you want this script to add the lines to your hosts file? (y/n)"
    read -r ADD_TO_HOSTS

    while [ "$ADD_TO_HOSTS" != "y" ] && [ "$ADD_TO_HOSTS" != "n" ]
    do
        echo -e "${Red}Invalid input.${NC}"
        echo "Do you want this script to add the line to your hosts file? (y/n)"
        read -r ADD_TO_HOSTS
    done

    if [ "$ADD_TO_HOSTS" == "y" ]
    then
        echo -e "${Blue}Adding the line to the hosts file...${NC}"
        echo "127.0.0.1 host.docker.internal" | sudo tee -a /etc/hosts
        echo "127.0.0.1 seq.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 minio.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 cryptalbum.local" | sudo tee -a /etc/hosts
        echo -e "${Green}Lines added.${NC}"
    fi
}

function finish() {
    echo "The setup is complete. Exiting."
}

introduction
add_to_hosts
clean_env_files
generate_nginx_certificates
set_up_minio_env_vars
set_up_postgres_env_vars
start_storage_services
generate_next_auth_secrets
save_minio_data_to_env
save_seq_data_to_env
start_app_container
finish
