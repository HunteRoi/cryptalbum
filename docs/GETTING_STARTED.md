# Getting Started

After you cloned this repository, you have a few things to do to have a working app.

Please follow the next steps in order to participate:
- install and start Docker (Docker Desktop if you are on Windows)
- run the next commands based on what environment you are willing to run

## Development
```bash
cd cryptalbum # to get into the repository's folder

yarn install # to install the dependencies

./start-database.sh # to create the database container

yarn db:push # to synchronize the Prisma schema located at ./prisma/schema.prisma with your local instance of PostgreSQL

yarn dev # to start the development instance of the application
```

## Production
*coming soon*
