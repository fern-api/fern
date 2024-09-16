import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { PhpProject } from "../project";
import { camelCase, upperFirst } from "lodash-es";
import { AsIsFiles } from "../AsIs";

export abstract class AbstractPhpGeneratorContext<
    CustomConfig extends BasePhpCustomConfigSchema
> extends AbstractGeneratorContext {
    private namespace: string;
    public readonly project: PhpProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.namespace = this.customConfig.namespace ?? upperFirst(camelCase(`${this.config.organization}`));
        this.project = new PhpProject({
            context: this,
            name: this.namespace
        });
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public getTestsNamespace(): string {
        return `${this.namespace}\\Tests`;
    }

    public getCoreNamespace(): string {
        return `${this.namespace}\\Core`;
    }

    public getCoreTestsNamespace(): string {
        return `${this.namespace}\\Tests\\Core`;
    }

    public abstract getRawAsIsFiles(): string[];

    public abstract getCoreAsIsFiles(): string[];

    public abstract getCoreTestAsIsFiles(): string[];

    public getCoreSerializationAsIsFiles(): string[] {
        return [
            AsIsFiles.ArrayType,
            AsIsFiles.Constant,
            AsIsFiles.DateType,
            AsIsFiles.JsonProperty,
            AsIsFiles.SerializableType,
            AsIsFiles.Union
        ];
    }

    public getCoreSerializationTestAsIsFiles(): string[] {
        return [
            AsIsFiles.DateArrayTypeTest,
            AsIsFiles.EmptyArraysTest,
            AsIsFiles.InvalidTypesTest,
            AsIsFiles.MixedDateArrayTypeTest,
            AsIsFiles.NestedUnionArrayTypeTest,
            AsIsFiles.NullableArrayTypeTest,
            AsIsFiles.NullPropertyTypeTest,
            AsIsFiles.ScalarTypesTest,
            AsIsFiles.TestTypeTest,
            AsIsFiles.UnionArrayTypeTest
        ];
    }
}
