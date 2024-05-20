import { LoggerConfiguration, ConsoleSink, type Logger, SeqSink } from 'serilogger';

import { env } from "@cryptalbum/env";
import { db } from '../db';
import { DatabaseSink } from './custom-sinks/DatabaseSink';
import type { Action } from './actions';

/**
 * A wrapper for the SeriLogger library, allowing to enrich the logger with additional properties
 * on the go then creates the logger instance when needed.
 */
export default class LogWrapper {
    #action: Action = 'UNKNOWN';
    #userId?: string;
    #config?: LoggerConfiguration;

    #logger?: Logger;

    /**
     * Enriches the logger with the `action` and `userId` properties
     *
     * @param {Action} action The action to enrich the logger with
     * @param {string|undefined} userId The user ID to enrich the logger with (default is 'N/A')
     * @return {LogWrapper} The logger wrapper instance
     */
    public enrich(action: Action, userId: string | undefined = 'N/A'): LogWrapper {
        if (this.#action !== action) this.#action = action;
        if (this.#userId !== userId) this.#userId = userId;

        this.#config = new LoggerConfiguration()
            .writeTo(new ConsoleSink({ includeTimestamps: true, includeProperties: false }))
            .enrich({ action, userId })
            .writeTo(new DatabaseSink(db))
            .writeTo(new SeqSink({ url: env.SEQ_URL, apiKey: env.SEQ_API_KEY }));

        return this;
    }

    /**
     * Enriches the logger with the `action` property
     *
     * @param {Action} action The action to enrich the logger with
     * @return {LogWrapper} The logger wrapper instance
     */
    public enrichWithAction(action: Action): LogWrapper {
        return this.enrich(action, this.#userId);
    }

    /**
     * Enriches the logger with the `userId` property
     *
     * @param {string} userId The user ID to enrich the logger with
     * @return {LogWrapper} The logger wrapper instance
     */
    public enrichWithUserId(userId: string): LogWrapper {
        return this.enrich(this.#action, userId);
    }

    /**
     * Creates the logger instance from the wrapper. This method must be called after calling .enrich()
     *
     * @return {Logger} The logger instance
     */
    public create(): Logger {
        if (!this.#config) throw new Error('No configuration set, please call enrich() first');

        this.#logger = this.#config?.create();
        return this.#logger;
    }
}
