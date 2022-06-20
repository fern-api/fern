import express, { Express } from "express";
import { PostsService } from "..";

export interface Server {
    getPost(id: string): string | Promise<string>;
}

export function expressMiddleware(impl: PostsService.Server): Express {
    const app = express();

    app.get("/posts/get", async (request, response) => {
        const result = await impl.getPost(request.body);
        response.send(result);
    });

    return app;
}
