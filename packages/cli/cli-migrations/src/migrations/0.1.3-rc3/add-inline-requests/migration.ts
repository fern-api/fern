import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";
import { getAllYamlFiles } from "./getAllYamlFiles";

export const migration: Migration = {
    name: "add-inline-requests",
    summary: "Replace endpoint requests with inline definitions",
    run: async ({ context }) => {
        const yamlFiles = await getAllYamlFiles(context);
        for (const filepath of yamlFiles) {
            try {
                await migrateYamlFile(filepath, context);
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error);
            }
        }
    }
};

async function migrateYamlFile(filepath: AbsoluteFilePath, context: TaskContext): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = YAML.parseDocument(contents.toString());
    const services = parsedDocument.get("services");
    if (services == null) {
        return;
    }
    if (!YAML.isMap(services)) {
        throw new Error("'services' is not a map");
    }

    const httpServices = services.get("http");
    if (httpServices == null) {
        return;
    }
    if (!YAML.isMap(httpServices)) {
        throw new Error("'http' is not a map");
    }

    for (const service of httpServices.items) {
        if (!YAML.isMap(service.value)) {
            context.failWithoutThrowing(`Service '${service.key}' is not a map`);
            continue;
        }
        const endpoints = service.value.get("endpoints");
        if (endpoints == null) {
            continue;
        }
        if (!YAML.isMap(endpoints)) {
            context.failWithoutThrowing(`Endpoints are not a map in service '${service.key}'`);
            continue;
        }
        for (const endpoint of endpoints.items) {
            if (!YAML.isMap(endpoint.value)) {
                context.failWithoutThrowing(`Endpoint ${endpoint.key} is not a map in service '${service.key}'`);
                continue;
            }
            try {
                convertEndpoint({ document: parsedDocument, endpoint: endpoint.value });
            } catch (e) {
                context.failWithoutThrowing("Failed to convert endpoint", e);
            }
        }
        await writeFile(filepath, parsedDocument.toString());
    }
}

function convertEndpoint({ document, endpoint }: { document: YAML.Document.Parsed; endpoint: YAML.YAMLMap }): void {
    const newRequest = new YAML.YAMLMap();

    const parsedRequestBody = parseRequestBody(endpoint);
    if (parsedRequestBody != null) {
        let newBody = new YAML.YAMLMap();

        const { requestBodyType, docs: originalRequestDocs } = parsedRequestBody;
        if (originalRequestDocs != null) {
            newBody.set("docs", originalRequestDocs);
        }
        newBody.set("type", requestBodyType);

        // check if request body type exists in the file.
        // if it does and it's an object, we instead inline the request
        const documentTypes = document.get("types");
        if (documentTypes != null) {
            if (!YAML.isMap(documentTypes)) {
                throw new Error("types are not a map");
            }
            const maybeTypeDeclarationForRequest = documentTypes.get(requestBodyType);

            if (maybeTypeDeclarationForRequest != null && YAML.isMap(maybeTypeDeclarationForRequest)) {
                const objectExtends = maybeTypeDeclarationForRequest.get("extends");
                const objectProperties = maybeTypeDeclarationForRequest.get("properties");
                if (objectExtends != null || objectProperties != null) {
                    // it's an object, so move to be the request body
                    newBody = maybeTypeDeclarationForRequest;
                    // inline requests can't have docs
                    newBody.delete("docs");

                    // set request wrapper name to be the old name
                    newRequest.set("name", requestBodyType);

                    // remove the old request body type
                    documentTypes.delete(requestBodyType);
                }
            }
        }

        newRequest.set("body", newBody);
    }

    const queryParameters = endpoint.get("query-parameters");
    if (queryParameters != null) {
        newRequest.set("query-parameters", queryParameters);
        endpoint.delete("query-parameters");
    }

    const headers = endpoint.get("headers");
    if (headers != null) {
        newRequest.set("headers", headers);
        endpoint.delete("headers");
    }

    if (newRequest.items.length > 0) {
        endpoint.set("request", newRequest);
    }
}

function parseRequestBody(
    endpoint: YAML.YAMLMap
): { requestBodyType: string; docs: YAML.Scalar | undefined } | undefined {
    const requestBody = endpoint.get("request");
    if (requestBody == null) {
        return undefined;
    }

    if (typeof requestBody === "string") {
        return { requestBodyType: requestBody, docs: undefined };
    }

    if (YAML.isMap(requestBody)) {
        const type = requestBody.get("type");
        if (type == null) {
            throw new Error("request type does not exist");
        }
        if (typeof type !== "string") {
            throw new Error("request type is not a string");
        }
        const docs = requestBody.get("docs", true);
        return {
            requestBodyType: type,
            docs
        };
    }

    throw new Error("request is not a string or a map");
}
