import express from "express";
import api from "./controllers/api";
import { register } from "./generated/register";

const PORT = 3000;

export function runServer(): void {
    const app = express();

    register(app, {
        api,
    });

    // eslint-disable-next-line no-console
    console.log(`Listening on port ${PORT}...`);
    app.listen(PORT);
}
