import express from "express";

export interface Response<T> {
    status: (code: number) => Response<T>;
    send: (responseBody: T) => Promise<void>;
    cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
    locals: any;
}