import { java } from "@fern-api/java-ast";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { getExampleEndpointCalls } from "./getExampleEndpointCalls";
import { extractRequestJson } from "./extractRequestJson";
import { extractResponseJson } from "./extractResponseJson";
import { buildClientCall } from "./buildClientCall";

export function generateTestMethod(
    endpoint: HttpEndpoint,
    service: HttpService, 
    context: SdkGeneratorContext
): java.Method {
    // Get the first successful example
    const examples = getExampleEndpointCalls(endpoint);
    const successExample = examples.find(ex => ex.response.type === "ok") || examples[0];
    
    if (!successExample) {
        throw new Error(`No example found for endpoint ${endpoint.name}`);
    }

    const testName = `test${endpoint.name.pascalCase.safeName}`;
    const requestJson = extractRequestJson(successExample);
    const responseJson = extractResponseJson(successExample);
    
    return java.method({
        name: testName,
        access: java.Access.Public,
        parameters: [],
        body: java.codeblock((writer) => {
            writer.writeLine("// Setup mock response");
            writer.writeLine("server.enqueue(new MockResponse()");
            writer.indent();
            writer.writeLine(`.setResponseCode(${successExample.response.type === "ok" ? 200 : 500})`);
            writer.writeLine(`.setBody("${responseJson.replace(/"/g, '\\"')}"));`);
            writer.dedent();
            writer.newLine();
            
            writer.writeLine("// Make the client call");
            writer.writeLine(`${buildClientCall(endpoint, successExample, service, context)};`);
            writer.newLine();
            
            writer.writeLine("// Verify the request");
            writer.writeLine("RecordedRequest recorded = server.takeRequest();");
            writer.writeLine("assertNotNull(recorded);");
            writer.writeLine(`assertEquals("${endpoint.method}", recorded.getMethod());`);
            writer.writeLine(`assertEquals("${successExample.url}", recorded.getPath());`);
            
            if (requestJson) {
                writer.newLine();
                writer.writeLine("// Verify request body");
                writer.writeLine("String requestBody = recorded.getBody().readUtf8();");
                writer.writeLine(`assertEquals("${requestJson.replace(/"/g, '\\"')}", requestBody);`);
            }
            
            if (successExample.serviceHeaders && successExample.serviceHeaders.length > 0) {
                writer.newLine();
                writer.writeLine("// Verify service headers");
                successExample.serviceHeaders.forEach(header => {
                    writer.writeLine(`assertEquals("${header.value.jsonExample}", recorded.getHeader("${header.name.wireValue}"));`);
                });
            }
            
            if (successExample.endpointHeaders && successExample.endpointHeaders.length > 0) {
                writer.newLine();
                writer.writeLine("// Verify endpoint headers");
                successExample.endpointHeaders.forEach(header => {
                    writer.writeLine(`assertEquals("${header.value.jsonExample}", recorded.getHeader("${header.name.wireValue}"));`);
                });
            }
        })
    });
}