import { csharp, CSharpFile, Generator } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AuthScheme } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface ConstructorParameter {
    name: string;
    docs?: string;
    isOptional: boolean;
    environmentVariable?: string;
}

export class RootClientGenerator extends Generator<SdkCustomConfigSchema, SdkGeneratorContext> {
    public generate(): CSharpFile {
        const class_ = csharp.class_({
            name: this.context.getRootClientClassName(),
            namespace: this.context.getNamespace(),
            partial: true,
            access: "public"
        });

        const rootPackage = this.context.ir.rootPackage;

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getDirectoryForServiceId(this.serviceId))
        });
    }

    private getConstructorParameters(): ConstructorParameter[] {
        const parameters: ConstructorParameter[] = [];

        // auth parameteers
        const auth = this.context.ir.auth;

        // global header parameters
    }

    private getParameterFromAuthScheme(scheme: AuthScheme): ConstructorParameter[] {
        switch (scheme.type) {
            case "header":
                return [
                    {
                        name: scheme.name.name.camelCase.safeName,
                        docs: scheme.docs,
                        isOptional: false,
                        environmentVariable: scheme.headerEnvVar
                    }
                ];
            case "bearer":
                return [
                    {
                        name: scheme.token.camelCase.safeName,
                        docs: scheme.docs,
                        isOptional: false,
                        environmentVariable: scheme.tokenEnvVar
                    }
                ];
            case "basic":
                return [
                    {
                        name: "username",
                        docs: "Username",
                        isOptional: false,
                        environmentVariable: scheme.environmentVariable
                    }
                ];
        }
    }
}
