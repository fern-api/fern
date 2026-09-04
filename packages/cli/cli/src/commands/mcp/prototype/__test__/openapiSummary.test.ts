import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadSpecSummaries } from "../openapiSummary.js";

const SPEC = `openapi: 3.0.0
info:
  title: Swagger Petstore
paths:
  /pets:
    get:
      operationId: listPets
      summary: List all pets
      tags: [pets]
    post:
      operationId: createPet
      tags: [pets]
  /pets/{petId}:
    get:
      operationId: getPet
      tags: [pets]
components:
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
`;

describe("loadSpecSummaries", () => {
    let directory: string;

    beforeAll(async () => {
        directory = await mkdtemp(join(tmpdir(), "mcp-prototype-"));
        await writeFile(join(directory, "openapi.yml"), SPEC);
        await writeFile(join(directory, "not-a-spec.yml"), "just: some yaml\n");
    });

    afterAll(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    it("summarizes endpoints from an OpenAPI document and skips non-specs", async () => {
        const summaries = await loadSpecSummaries(directory);
        expect(summaries).toHaveLength(1);
        const summary = summaries[0];
        expect(summary?.title).toBe("Swagger Petstore");
        expect(summary?.endpoints).toHaveLength(3);
        expect(summary?.endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`)).toEqual([
            "GET /pets",
            "POST /pets",
            "GET /pets/{petId}"
        ]);
        expect(summary?.securitySchemeNames).toEqual(["apiKey"]);
        const listPets = summary?.endpoints.find((endpoint) => endpoint.operationId === "listPets");
        expect(listPets?.tags).toEqual(["pets"]);
        expect(listPets?.summary).toBe("List all pets");
        expect(listPets?.estimatedTokens).toBeGreaterThan(60);
    });
});
