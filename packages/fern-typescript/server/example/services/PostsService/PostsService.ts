import express, { Express } from "express";

export interface PostsService {
    getPost(id: string): string | Promise<string>;
}

export function expressMiddleware(impl: PostsService): Express {
    const app = express();

    app.get("/posts/get", async (request, response) => {
        const result = await impl.getPost(request.body);
        response.status(
            result.ok
                ? 200
                : model.posts._GetPostErrorBody._visit(result.error, {
                      notFound: () => 404,
                  })
        );
        response.send(result);
    });

    return app;
}
