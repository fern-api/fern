import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImdbClient } from "@imdb/client";
import * as schemas from "../schemas";

const client = new ImdbClient();

export const createMovie = {
  register(server: McpServer) {
    return server.tool(
      "create_movie",
      "Add a movie to the database using the movies/* /... path.",
      schemas.createMovieRequest,
      async (params) => {
        const result = await client.createMovie(params);
        return {
          content: [{ type: "text", text: result }],
        };
    }
    );
  }
};


export const getMovie = {
  register(server: McpServer) {
    return server.tool(
      "get_movie",
      undefined,
      undefined,
      async (params) => {
        const result = await client.getMovie(params);
        return {
          content: [{ type: "text", text: result }],
        };
    }
    );
  }
};
