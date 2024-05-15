export function hasProp<T extends object>(obj: T, prop: string): obj is T & { [key: string]: unknown } {
    return prop in obj;
}

export function hasNonNullProp<T extends object, TProp>(obj: T, prop: string): obj is T & { [key: string]: NonNullable<TProp> } {
    return hasProp(obj, prop) && isNonNull(obj[prop]);
}

export function isNonNull<T>(value: T | undefined | null): value is NonNullable<T> {
    return value !== null && value !== undefined;
}
