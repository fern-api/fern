import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { ClientConfigGenerator } from "../generators/ClientConfigGenerator";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext";

// Helper function to read AsIs files
function readAsIsFile(fileName: string): string {
    const asIsPath = path.join(__dirname, "../../../base/src/asIs", fileName);
    return fs.readFileSync(asIsPath, "utf-8");
}

// Generate ClientConfig for testing using the generator
const context = createSampleGeneratorContext();
const clientConfigGenerator = new ClientConfigGenerator(context);
const CLIENT_CONFIG = clientConfigGenerator.generate().fileContents;

// Read AsIs files for testing
const API_CLIENT_BUILDER = readAsIsFile("api_client_builder.rs");
const HTTP_CLIENT = readAsIsFile("http_client.rs");
const CLIENT_ERROR = readAsIsFile("client_error.rs");
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

        it("should match ClientError from AsIs folder", async () => {
            await expect(CLIENT_ERROR).toMatchFileSnapshot("snapshots/client-error-auth.rs");
        });

        it("should match RequestOptions from AsIs folder", async () => {
            await expect(REQUEST_OPTIONS).toMatchFileSnapshot("snapshots/request-options-comprehensive.rs");
        });
    });
});
