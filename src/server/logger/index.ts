import LogWrapper from "./logger";

/**
 * An unconfigured logger instance on which you can call .enrich() and .create() directly
 */
export const unconfiguredLogger = new LogWrapper();
