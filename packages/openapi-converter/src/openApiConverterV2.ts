import SwaggerParser from "@apidevtools/swagger-parser";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import { OpenApiV3Converter } from "./v3/OpenApiV3Converter";

export interface ConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    serviceFiles: Record<RelativeFilePath, ServiceFileSchema>;
}

declare namespace OpenApiConverter {
    interface Args {
        openApiFilePath: string;
        logger: Logger;
    }
}

export class OpenApiConverter {
    private openApiFilePath: string;
    private logger: Logger;

    constructor(args: OpenApiConverter.Args) {
        this.openApiFilePath = args.openApiFilePath;
        this.logger = args.logger;
    }

    public async convert(): Promise<ConvertedFernDefinition> {
        this.logger.debug(`Reading Open API from ${this.openApiFilePath}`);
        const openApiDocument = await SwaggerParser.parse(this.openApiFilePath);
        if (isOpenApiV3(openApiDocument)) {
            const openApiV3Converter = new OpenApiV3Converter({
                openApiV3: openApiDocument,
                logger: this.logger,
            });
            return openApiV3Converter.convert();
        } else {
            throw new Error("Open API converter only handles V3 specs. Received v2.");
        }
    }
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}
