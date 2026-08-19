import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { ApiClientBuilderGenerator } from "../generators/ApiClientBuilderGenerator.js";
import { ClientConfigGenerator } from "../generators/ClientConfigGenerator.js";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext.js";

// Helper function to read AsIs files
function readAsIsFile(fileName: string): string {
    const asIsPath = path.join(__dirname, "../../../base/src/asIs", fileName);
    return fs.readFileSync(asIsPath, "utf-8");
}

// Generate ClientConfig for testing using the generator
const context = createSampleGeneratorContext();
const clientConfigGenerator = new ClientConfigGenerator(context);
const CLIENT_CONFIG = clientConfigGenerator.generate().fileContents;

// Generate ApiClientBuilder for testing using the generator
const apiClientBuilderGenerator = new ApiClientBuilderGenerator(context);
const API_CLIENT_BUILDER = apiClientBuilderGenerator.generate().fileContents;

const HTTP_CLIENT = readAsIsFile("http_client.rs");
const REQUEST_OPTIONS = readAsIsFile("request_options.rs");

describe("ClientConfig Auth Patterns", () => {
    describe("Base AsIs Files", () => {
        it("should match ClientConfig from AsIs folder", async () => {
            await expect(CLIENT_CONFIG).toMatchFileSnapshot("snapshots/client-config-api-key.rs");
        });

        it("should match ApiClientBuilder from AsIs folder", async () => {
            await expect(API_CLIENT_BUILDER).toMatchFileSnapshot("snapshots/api-client-builder-api-key.rs");
        });

        it("should match HttpClient from AsIs folder", async () => {
            await expect(HTTP_CLIENT).toMatchFileSnapshot("snapshots/http-client-api-key.rs");
        });

        it("should match RequestOptions from AsIs folder", async () => {
            await expect(REQUEST_OPTIONS).toMatchFileSnapshot("snapshots/request-options-comprehensive.rs");
        });
    });
});
