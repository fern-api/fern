import { getTextOfTsKeyword } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
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
                name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.BASE_PATH,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
        ],
    });

    return module;
}
