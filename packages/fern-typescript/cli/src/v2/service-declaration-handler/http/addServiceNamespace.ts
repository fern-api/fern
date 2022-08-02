import { getTextOfTsKeyword } from "@fern-typescript/commons";
import { ModuleDeclaration, ts } from "ts-morph";
import { File } from "../../client/types";
import { ClientConstants } from "../constants";

export function addServiceNamespace({ file, moduleName }: { file: File; moduleName: string }): ModuleDeclaration {
    const module = file.sourceFile.addModule({
        name: moduleName,
        isExported: true,
        hasDeclareKeyword: true,
    });

    module.addInterface({
        name: ClientConstants.HttpService.ServiceNamespace.Init.TYPE_NAME,
        properties: [
            {
                name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.ORIGIN,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
        ],
    });

    return module;
}
