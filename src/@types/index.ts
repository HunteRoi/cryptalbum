export type NonEmptyArray<T> = [T, ...T[]];

export type Extended<T, Key extends string, KeyType> = T & { [key in Key]: KeyType };
