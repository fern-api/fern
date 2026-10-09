import { describe, expect, it, vi } from "vitest";

import { bundleRemoteOpenAPI } from "../utils/bundleRemoteOpenAPI.js";

describe("bundleRemoteOpenAPI", () => {
    it("resolves nested paths relative to the remote root URL", async () => {
        const documents = new Map([
            [
                "https://specs.example.com/apis/openapi.yml",
                `openapi: 3.0.0
info:
  title: Petstore
  version: 1.0.0
paths:
  /pets:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: ./components/pet.yml#/Pet
`
            ],
            [
                "https://specs.example.com/apis/components/pet.yml",
                `Pet:
  type: object
  required: [name]
  properties:
    name:
      type: string
    owner:
      $ref: ./owner.yml#/Owner
`
            ],
            [
                "https://specs.example.com/apis/components/owner.yml",
                `Owner:
  type: object
  properties:
    id:
      type: string
`
            ]
        ]);
        const loadRemote = vi.fn(async (url: string) => {
            const body = documents.get(url);
            if (body == null) {
                throw new Error(`Unexpected URL: ${url}`);
            }
            return { body, mimeType: "application/yaml" };
        });

        const bundled = await bundleRemoteOpenAPI("https://specs.example.com/apis/openapi.yml", loadRemote);

        expect(loadRemote).toHaveBeenCalledWith("https://specs.example.com/apis/components/pet.yml");
        expect(loadRemote).toHaveBeenCalledWith("https://specs.example.com/apis/components/owner.yml");
        expect(JSON.stringify(bundled)).not.toContain("./components/pet.yml");
        expect(JSON.stringify(bundled)).not.toContain("./owner.yml");
        expect(bundled).toMatchObject({
            components: {
                schemas: {
                    Pet: {
                        type: "object",
                        required: ["name"]
                    },
                    Owner: {
                        type: "object"
                    }
                }
            }
        });
    });
});
