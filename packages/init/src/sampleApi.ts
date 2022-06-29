import { RawSchemas } from "@fern-api/syntax-analysis";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export async function writeSampleApiToDirectory(dir: string): Promise<void> {
    await writeFile(path.join(dir, API_FILENAME), yaml.dump(API));
}

const API_FILENAME = "api.yml";

const API: RawSchemas.FernConfigurationSchema = {
    ids: ["MovieId"],
    types: {
        Movie: {
            properties: {
                id: "MovieId",
                title: "string",
                rating: "double",
            },
        },
    },
    errors: {
        NotFoundError: {
            http: {
                statusCode: 404,
            },
        },
    },
    services: {
        http: {
            MoviesService: {
                auth: "none",
                "base-path": "/movies",
                endpoints: {
                    createMovie: {
                        method: "POST",
                        path: "/",
                        request: {
                            type: {
                                properties: {
                                    title: "string",
                                    rating: "double",
                                },
                            },
                        },
                        response: "MovieId",
                    },
                    getMovie: {
                        method: "GET",
                        path: "/{movieId}",
                        "path-parameters": {
                            postId: "MovieId",
                        },
                        response: {
                            ok: "Movie",
                            failed: {
                                errors: ["NotFoundError"],
                            },
                        },
                    },
                },
            },
        },
    },
};
