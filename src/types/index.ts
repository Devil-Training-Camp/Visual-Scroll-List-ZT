export interface MyResponseType<T = any> {
    code: number;
    message: string;
    data: T;
}

export interface User {
    name: string;
}
