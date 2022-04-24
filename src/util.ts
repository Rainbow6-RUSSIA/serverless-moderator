export const isTruthy = <T>(x: T | Falsy): x is T => !!x
export declare type Falsy = false | 0 | "" | null | undefined;