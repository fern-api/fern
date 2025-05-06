import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SeedApiClient } from "seed-api/dist";
import * as schemas from "../schemas";

const client = new SeedApiClient({
    environment: () => ""
});

// request
// typeReference: named: imdb
// request
// undefined
export const imdbCreateMovie = {
    register(server: McpServer) {
        return server.tool(
            "imdb_create_movie",
            "Add a movie to the database using the movies/* /... path.",
            schemas.imdbCreateMovieRequest.shape,
            async (params) => {
                const result = await client.imdb.createMovie(params);
                return {
                    content: [{ type: "text", text: JSON.stringify(result) }]
                };
            }
        );
    }
};

// undefined
// undefined
// undefined
// undefined
export const imdbGetMovie = {
    register(server: McpServer) {
        return server.tool(
            "imdb_get_movie",
            { movieId: schemas.movieId },
            async (params) => {
                const result = await client.imdb.getMovie(params);
                return {
                    content: [{ type: "text", text: JSON.stringify(result) }]
                };
            }
        );
    }
};

