import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SeedClient } from "@seed/seed-sdk";
import * as schemas from "../schemas";

const client = new SeedClient();

export const createMovie = {
    register(server: McpServer) {
        return server.tool(
            "create_movie",
            "Add a movie to the database using the movies/* /... path.",
            schemas.createMovieRequest.shape,
            async (params) => {
                const result = await client.createMovie(params);
                return {
                    content: [{ type: "text", text: result }]
                };
            }
        );
    }
};

export const getMovie = {
    register(server: McpServer) {
        return server.tool(
            "get_movie",
            async (params) => {
                const result = await client.getMovie(params);
                return {
                    content: [{ type: "text", text: result }]
                };
            }
        );
    }
};

