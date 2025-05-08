import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SeedApiClient } from "seed-api/dist";
import * as schemas from "../schemas";

const client = new SeedApiClient({
    environment: () => ""
});

// "POST"
export const imdbCreateMovie = {
    register(server: McpServer) {
        return server.tool(
            "imdb_create_movie",
            "Add a movie to the database using the movies/* /... path.",
            schemas.ImdbCreateMovieRequest.shape,
            async (params) => {
                const { ...restParams } = params;
                const result = await client.imdb.createMovie(restParams);
                return {
                    content: [{ type: "text", text: JSON.stringify(result) }]
                };
            }
        );
    }
};

// "GET"
export const imdbGetMovie = {
    register(server: McpServer) {
        return server.tool(
            "imdb_get_movie",
            { movieId: schemas.ImdbMovieId },
            async (params) => {
                const { movieId } = params;
                const result = await client.imdb.getMovie(movieId);
                return {
                    content: [{ type: "text", text: JSON.stringify(result) }]
                };
            }
        );
    }
};

