import { type Sink, type LogEvent, LogEventLevel } from 'serilogger';
import type { Prisma } from '@prisma/client';

import type { DatabaseType } from '@cryptalbum/server/db';
import { hasNonNullProp, isNonNull } from '@cryptalbum/utils/types';
import { generateHmac } from '@cryptalbum/crypto';
import { env } from '@cryptalbum/env';
import { toJsonData } from '../utils';

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

    protected async writeToDatabase(event: LogEvent): Promise<void> {
        let userId: string | null = null;
        if (hasNonNullProp<object, string>(event.properties, 'userId') && isNonNull<string>(event.properties.userId)) {
            userId = event.properties.userId;
        }
        const action: string = hasNonNullProp<object, string>(event.properties, 'action') && isNonNull<string>(event.properties.action) ? event.properties.action : 'UNKNOWN';
        const hmac = await generateHmac(toJsonData(event.properties), env.SERVER_LOG_SECRET_KEY)

        const message = event.messageTemplate.render(event.properties ?? {});
        const parameters = toJsonData(event.properties ?? {});

        const data: Prisma.LogCreateInput = {
            createdAt: new Date(event.timestamp),
            action: action,
            message: message,
            args: parameters,
            level: LogEventLevel[event.level],
            hmac
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
