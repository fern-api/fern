import { AbstractCsharpGeneratorContext, csharp } from "@fern-api/csharp-codegen";
import { ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorContext extends AbstractCsharpGeneratorContext<SdkCustomConfigSchema> {
    public packageName(): string {
        return "TODO";
    }

    public getFilepathForTypeId(typeId: TypeId): string {
        return "TODO";
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        return "TODO";
    }

    public getClassReferenceForTypeId(typeId: TypeId): csharp.ClassReference {
        return new csharp.ClassReference({ namespace: "TODO", name: "TODO" });
    }

    public getAllPropertiesIncludingExtensions(typeId: TypeId): ObjectProperty[] {
        return [];
    }
}
