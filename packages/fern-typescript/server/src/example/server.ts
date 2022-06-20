import express from "express";
import { PostsService } from "./services";

const app = express();

export class PostsResource implements PostsService.Server {
    public getPost(id: string): string | Promise<string> {
        return `Post: ${id}`;
    }
}

async function createServer() {
    app.use(PostsService.expressMiddleware(new PostsResource()));
    app.listen(3000);
}

void createServer();
