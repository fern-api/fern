import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace BaseClientTypeGenerator {
    export interface Init {
        generateIdempotentRequestOptions: boolean;
    }
}

export class BaseClientTypeGenerator {
    private readonly generateIdempotentRequestOptions: boolean;

    constructor({ generateIdempotentRequestOptions }: BaseClientTypeGenerator.Init) {
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
    }

    public writeToFile(context: SdkContext): void {
        context.sourceFile.addInterface(context.baseClient.generateBaseClientOptionsInterface(context));
        context.sourceFile.addInterface(context.baseClient.generateBaseRequestOptionsInterface(context));
        if (this.generateIdempotentRequestOptions) {
            context.sourceFile.addInterface(context.baseClient.generateBaseIdempotentRequestOptionsInterface(context));
        }

        this.generateNormalizeClientOptionsFunction(context);
    }

    private generateNormalizeClientOptionsFunction(context: SdkContext): void {
        context.importsManager.addImportFromRoot("core/headers", {
            namedImports: ["mergeHeaders"]
        });

        const sdkName = context.npmPackage?.packageName ?? "unknown";
        const sdkVersion = context.npmPackage?.version ?? "0.0.0";

        const functionCode = `
export function normalizeClientOptions<T extends BaseClientOptions>(
    options: T
): T {
    const logging = ${getTextOfTsNode(
        context.coreUtilities.logging.createLogger._invoke(ts.factory.createIdentifier("options?.logging"))
    )};

    const headers = mergeHeaders(
        {
            "X-Fern-Language": "JavaScript",
            "X-Fern-SDK-Name": "${sdkName}",
            "X-Fern-SDK-Version": "${sdkVersion}",
            "User-Agent": "${sdkName}/${sdkVersion}",
            "X-Fern-Runtime": ${getTextOfTsNode(context.coreUtilities.runtime.type._getReferenceTo())},
            "X-Fern-Runtime-Version": ${getTextOfTsNode(context.coreUtilities.runtime.version._getReferenceTo())},
        },
        options?.headers
    );

    return {
        ...options,
        logging,
        headers,
    } as T;
}`;

        context.sourceFile.addStatements(functionCode);
    }
}
