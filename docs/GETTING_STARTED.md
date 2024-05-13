# Getting Started

After you cloned this repository, you have a few things to do to have a working app.

Please follow the next steps in order to participate:
- install and start Docker (Docker Desktop if you are on Windows)
- create your `.env` file based on the [example](../.env.example) in the repository
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/cryptalbum" # you can change the password to something you generate

#NEXTAUTH_SECRET="" # uncomment this line and add a value
NEXTAUTH_URL="http://localhost:3000"
```
- create your docker-compose env variables based on the [minio env example](../.minio.env.example) and [postgres env example](../.postgres.env.example) in the repository :
  - `.minio.env`
```bash
MINIO_ROOT_USER=root
MINIO_ROOT_PASSWORD=supersecretpassword
```
As mentionned in the minio's example .env file, the policy requires *a minimum of 9 characters, including an uppercase and numbers*.
  - `.postgres.env` (the values are extracted from the database URL in the `.env` file)
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=cryptalbum
```

⚠️ Keep in mind that if you are not running this from your local computer, you might need to tweek some variables (like NEXTAUTH_URL).

- run the next commands based on what environment you are willing to run

## Development
```bash
cd cryptalbum # to get into the repository's folder

yarn install # to install the dependencies

docker-compose up

yarn db:push # to synchronize the Prisma schema located at ./prisma/schema.prisma with your local instance of PostgreSQL

yarn dev # to start the development instance of the application
```

## Production
*coming soon*
