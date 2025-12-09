import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    KotlinFile as AstKotlinFile,
    DataClass,
    Parameter,
    Type,
    Enum,
    EnumValue,
    SealedClass
} from "@fern-api/kotlin-ast";
import { KotlinFile } from "@fern-api/kotlin-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ModelGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    public async generate(): Promise<void> {
        this.context.logger.info("Generating models...");

        for (const [typeId, typeDeclaration] of Object.entries(this.context.ir.types)) {
            const file = this.generateTypeDeclaration(typeDeclaration);
            if (file != null) {
                this.context.project.addFile(file);
            }
        }
    }

    private generateTypeDeclaration(typeDeclaration: any): KotlinFile | null {
        const typeName = typeDeclaration.name.name.pascalCase.safeName;
        const packageName = this.context.getPackageName();

        switch (typeDeclaration.shape.type) {
            case "object":
                return this.generateObjectType(typeName, typeDeclaration, packageName);
            case "enum":
                return this.generateEnumType(typeName, typeDeclaration, packageName);
            case "union":
                return this.generateUnionType(typeName, typeDeclaration, packageName);
            case "alias":
                return null;
            default:
                this.context.logger.warn(`Unsupported type shape: ${typeDeclaration.shape.type}`);
                return null;
        }
    }

    private generateObjectType(typeName: string, typeDeclaration: any, packageName: string): KotlinFile {
        const properties: Parameter[] = typeDeclaration.shape.properties.map((property: any) => {
            const propertyName = property.name.name.camelCase.safeName;
            const propertyType = this.convertType(property.valueType);

            return new Parameter({
                name: propertyName,
                type: propertyType,
                modifiers: ["val"]
            });
        });

        const dataClass = new DataClass({
            name: typeName,
            properties,
            docs: typeDeclaration.docs ?? undefined
        });

        const kotlinFile = new AstKotlinFile({
            packageName,
            classes: [dataClass]
        });

        const filePath = RelativeFilePath.of(`src/main/kotlin/${packageName.replace(/\./g, "/")}/${typeName}.kt`);
        return new KotlinFile(filePath, kotlinFile);
    }

    private generateEnumType(typeName: string, typeDeclaration: any, packageName: string): KotlinFile {
        const values: EnumValue[] = typeDeclaration.shape.values.map((value: any) => {
            return new EnumValue({
                name: value.name.name.screamingSnakeCase.safeName,
                value: value.name.wireValue,
                docs: value.docs ?? undefined
            });
        });

        const enumClass = new Enum({
            name: typeName,
            values,
            docs: typeDeclaration.docs ?? undefined
        });

        const kotlinFile = new AstKotlinFile({
            packageName,
            classes: [enumClass]
        });

        const filePath = RelativeFilePath.of(`src/main/kotlin/${packageName.replace(/\./g, "/")}/${typeName}.kt`);
        return new KotlinFile(filePath, kotlinFile);
    }

    private generateUnionType(typeName: string, typeDeclaration: any, packageName: string): KotlinFile {
        const sealedClass = new SealedClass({
            name: typeName,
            docs: typeDeclaration.docs ?? undefined
        });

        const kotlinFile = new AstKotlinFile({
            packageName,
            classes: [sealedClass]
        });

        const filePath = RelativeFilePath.of(`src/main/kotlin/${packageName.replace(/\./g, "/")}/${typeName}.kt`);
        return new KotlinFile(filePath, kotlinFile);
    }

    private convertType(irType: any): Type {
        switch (irType.type) {
            case "primitive":
                return this.convertPrimitiveType(irType.primitive);
            case "container":
                return this.convertContainerType(irType.container);
            case "named":
                return new Type({ name: irType.typeId });
            case "unknown":
                return Type.any();
            default:
                return Type.any();
        }
    }

    private convertPrimitiveType(primitive: string): Type {
        switch (primitive) {
            case "STRING":
                return Type.string();
            case "INTEGER":
                return Type.int();
            case "LONG":
                return Type.long();
            case "DOUBLE":
                return Type.double();
            case "BOOLEAN":
                return Type.boolean();
            default:
                return Type.any();
        }
    }

    private convertContainerType(container: any): Type {
        switch (container.type) {
            case "list":
                return Type.list(this.convertType(container.list));
            case "set":
                return Type.set(this.convertType(container.set));
            case "map":
                return Type.map(this.convertType(container.keyType), this.convertType(container.valueType));
            case "optional":
                const innerType = this.convertType(container.optional);
                return new Type({ name: innerType.name, nullable: true, typeParameters: innerType.typeParameters });
            default:
                return Type.any();
        }
    }
}
