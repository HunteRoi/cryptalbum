# CryptAlbum

<!-- PROJECT LOGO -->
<a href="https://sonarcloud.io/summary/new_code?id=HunteRoi_cryptalbum">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=HunteRoi_cryptalbum&metric=alert_status" alt="Quality Gate Status"/>
</a>
<a href="https://snyk.io/test/github/hunteroi/cryptalbum">
    <img src="https://snyk.io/test/github/hunteroi/cryptalbum/badge.svg" alt="Known Vulnerabilities" />
</a>
<a href="https://codescene.io/projects/51876">
    <img src="https://codescene.io/projects/51876/status-badges/code-health" alt="CodeScene Health" />
</a>


<!-- TABLE OF CONTENTS -->

## Table of Contents

[TOC]

## Overview

CryptAlbum is an end-to-end encrypted gallery of photos. You can access it from any device you want and store your
photos safely to share to your friends and family.

![overview gif][./docs/assets/overview.gif]

## How it works

It is recommended to read the [documentation](./docs/) for more insight on the topic.

If you want the **PDF** version of the documentation, please head to [the artifacts section](/-/artifacts).
You can also download the latest artifact [by clicking here](/-/jobs/artifacts/nivelling/download?job=convert_to_pdf).

## Getting Started

### Prerequisites

The first step is basically to clone the repository (`git clone`). Once this is done, you have a few configuration steps
to achieve.

1. Install and start Docker (you can use [Docker Desktop](https://www.docker.com/products/docker-desktop/) if you are on
   Windows).

2. Type `cp .minio.env.example .minio.env` to create a `.minio.env` file from the [example](.env.minio.example)
   available on the repo **and update the keys accordingly**:
  - `MINIO_ROOT_USER` is the account's name ;
  - `MINIO_ROOT_PASSWORD` is the account's password.

1. Type `cp .postgres.env.example .postgres.env` to create a `.postgres.env` file from
   the [example](.env.postgres.example) available on the repo **and update the keys accordingly**:
  - `POSTGRES_USER` is the database user name ;
  - `POSTGRES_PASSWORD` is the database user's password ;
  - `POSTGRES_DB` is the database name.

2. Type `cp .env.example .env` to create a `.env` file from the [example](.env.example) available on the repository *
   *and update the keys accordingly**.

3. Run the [docker-compose](./docker-compose.yml) script to build all the containers needed for the application to run.

#### Development

In a development phase, you will need to set the following keys:
<!-- TABLE -->

|    **Key**        	     |           **Default Value**                    	           |                                                                     **Description**                                                                                                            	                                                                     |
|:-----------------------:|:----------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| DATABASE_URL          	 | postgresql://postgres:password@localhost:5432/cryptalbum 	 |               You will need to change the "password" bit to comply with security measures.                                                                                                                                                           	               |
| NEXTAUTH_SECRET       	 |                             	                              |               You can generate a secret using OpenSSL : `openssl rand -base64 32`                                                                                                                                                                    	               |
| NEXTAUTH_URL          	 | http://localhost:3000                                    	 |                                                                                                                                  	                                                                                                                                   |
| MINIO_ACCESS_KEY      	 |                             	                              |         You can generate then copy paste this value from the Minio portal of your container, at [this link](http://localhost:9001/access-keys)                                                                                                             	         |
| MINIO_SECRET_KEY      	 |                             	                              |         You can generate then copy paste this value from the Minio portal of your container, at [this link](http://localhost:9001/access-keys)                                                                                                             	         |
| MINIO_ENDPOINT        	 | localhost                                                	 |                                                                                                                                  	                                                                                                                                   |
| MINIO_PORT            	 | 9000                                                     	 |                                                                                                                                  	                                                                                                                                   |
| MINIO_BUCKET          	 | cryptalbum                                               	 |                                                                                                                                  	                                                                                                                                   |
| MINIO_REGION          	 | eu-west-1                                                	 |                                                                                                                                  	                                                                                                                                   |
| MINIO_SECURE          	 | false                                                    	 |                                                                                                                                  	                                                                                                                                   |
| SEQ_API_KEY           	 |                             	                              | You can generate then copy paste this value from the Seq portal of your container, at [this link](http://localhost:8081/#/settings/api-keys).<br/> *⚠️ You might not be able to access this portal from a Firefox browser. Use Chrome or Edge if that's the case.* 	 |
| SEQ_URL               	 | https://localhost:5341                                   	 |                                                                                                                                  	                                                                                                                                   |
| SERVER_LOG_SECRET_KEY 	 |                             	                              |               You can generate a secret using OpenSSL : `openssl rand -base64 64`                                                                                                                                                                    	               |

<!-- END TABLE -->

You will then need to execute the following steps:

1. Download the dependencies with `yarn install`.

2. Push the database schema with `yarn db:push`.

3. Run the project startup script with `yarn dev`.

### Contributing

We welcome contributions to this project!
If you have ideas, suggestions, or bug reports, please open an issue or submit a pull request. Follow these steps to
contribute:

- Fork the repository.
- Create a new branch for your feature or bugfix.
- Make your changes and commit them with clear and concise messages.
- Open a pull request to the main repository.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgement

CryptAlbum has been created with [T3 Stack](https://create.t3.gg/).

The contributors to this project are:
- [ALBANESE Matteo - etu55891](https://gitlab.com/CaiiTa7)
- [ARTS Loïck - etu45363](https://github.com/MRGoose70)
- [BELTUS Lucas - etu45170](https://gitlab.com/Lucas.Beltus)
- [BERNARD Christophe - etu39862](https://github.com/drakexorn)
- [BOLLE Emilien - etu45187](https://github.com/Bollemii)
- [DEVRESSE Tinaël - etu33784](https://github.com/hunteroi)

A special thank you to [Steven Sermeus](https://github.com/StevenSermeus) for the tips on some questions we had during
the development phase.
