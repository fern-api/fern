import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Helper function to read AsIs files
function readAsIsFile(fileName: string): string {
    const asIsPath = path.join(__dirname, "../../../base/src/asIs", fileName);
    return fs.readFileSync(asIsPath, "utf-8");
}

// Read AsIs files for testing
const CLIENT_CONFIG = readAsIsFile("client_config.rs");
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
