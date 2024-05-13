import { type Sink, type LogEvent, LogEventLevel } from 'serilogger';
import type { Prisma } from '@prisma/client';

import type { DatabaseType } from '@cryptalbum/server/db';

export class DatabaseSink implements Sink {
    private readonly database: DatabaseType;

    constructor(database: DatabaseType) {
        this.database = database;
    }

    public emit(events: LogEvent[]) {
        for (const event of events) {
            this.writeToDatabase(event).catch(console.error);
        }
    }

    public flush() {
        return Promise.resolve();
    }

    private hasProp(obj: object, prop: string): obj is Record<string, string> {
        return prop in obj;
    }

    private hasNonNullProp(obj: object, prop: string): obj is Record<string, NonNullable<string>> {
        return this.hasProp(obj, prop) && this.isNonNull(obj[prop]);
    }

    private isNonNull<T>(value: T): value is NonNullable<T> {
        return value !== null && value !== undefined;
    }

    protected async writeToDatabase(event: LogEvent): Promise<void> {
        let userId: string | null = null;
        if (this.hasNonNullProp(event.properties, 'userId') && this.isNonNull(event.properties.userId)) {
            userId = event.properties.userId;
        }
        const action: string = this.hasNonNullProp(event.properties, 'action') && this.isNonNull(event.properties.action) ? event.properties.action : 'UNKNOWN';
        const message = event.messageTemplate.render(event.properties ?? {});
        const parameters = toJsonData(event.properties ?? {});

        const data: Prisma.LogCreateInput = {
            createdAt: new Date(event.timestamp),
            action: action,
            message: message,
            args: parameters,
            level: LogEventLevel[event.level]
        };

        if (userId) {
            const user = await this.database.user.findUnique({ where: { id: userId } });
            if (user) {
                data.user = {
                    connect: { id: userId }
                };
            }
        }

        await this.database.log.create({ data });
    }
}

function toJsonData(data: object) {
    return JSON.parse(JSON.stringify(data));
}
