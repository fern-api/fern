import { RawSchemas } from "@fern-api/syntax-analysis";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export async function writeSampleApiToDirectory(dir: string): Promise<void> {
    await writeFile(path.join(dir, BLOG_POST_API_FILENAME), yaml.dump(BLOG_POST_API));
}

const BLOG_POST_API_FILENAME = "blog.yml";

const BLOG_POST_API: RawSchemas.RawFernConfigurationSchema = {
    imports: {
        menu: BLOG_POST_API_FILENAME,
    },
    ids: ["PostId"],
    types: {
        BlogPost: {
            docs: "A blog post",
            properties: {
                id: "PostId",
                type: "PostType",
                title: "string",
                author: "Author",
                content: "string",
            },
        },
        PostType: {
            enum: ["LONG", "SHORT"],
        },
        Author: {
            union: {
                anonymous: {},
                name: "string",
            },
        },
    },
    errors: {
        PostNotFoundError: {
            http: {
                statusCode: 400,
            },
            properties: {
                id: "PostId",
            },
        },
    },
    services: {
        http: {
            PostsService: {
                "base-path": "/posts",
                endpoints: {
                    createPost: {
                        docs: "Create a new blog post",
                        method: "POST",
                        path: "/create",
                        request: {
                            properties: {
                                title: "string",
                                author: "Author",
                                content: "string",
                                postType: "PostType",
                            },
                        },
                    },
                    getPost: {
                        method: "GET",
                        path: "/{postId}",
                        parameters: {
                            postId: "PostId",
                        },
                        response: "BlogPost",
                        errors: {
                            union: {
                                notFound: "PostNotFoundError",
                            },
                        },
                    },
                },
            },
        },
    },
};
