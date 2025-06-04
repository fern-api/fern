import { SeedApiClient } from "seed-api";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as schemas from "../schemas";

const client = new SeedApiClient({
    environment () {
        return "";
    },
});

export const imdbCreateMovie = {
    register (server: McpServer) {
        return server.tool(
            "imdb_create_movie",
            "Add a movie to the database using the movies/* /... path.",
            schemas.ImdbCreateMovieRequest.shape,
            async function (params) {
                const request = params;
                const result = await client.imdb.createMovie(request);
                return {
                    content: [{ type: "text", text: JSON.stringify(result) }],
                };
            }
        );
    },
};
export const imdbGetMovie = {
    register (server: McpServer) {
        return server.tool(
            "imdb_get_movie",
            {
                movieId: schemas.ImdbMovieId,
            },
            async function (params) {
                const { movieId } = params;
                const result = await client.imdb.getMovie(movieId);
                return {
                    content: [{ type: "text", text: JSON.stringify(result) }],
                };
            }
        );
    },
};
