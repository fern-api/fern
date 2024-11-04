import { WriteablePythonFile } from "@fern-api/base-python-generator";
import { python } from "@fern-api/python-ast";
import { NameAndWireValue, ObjectTypeDeclaration, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";
import { RelativeFilePath } from "@fern-api/fs-utils";

export class ObjectGenerator {
    constructor(
        private readonly typeId: TypeId,
        private readonly context: PydanticModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {}

    public doGenerate(): WriteablePythonFile {
        const class_ = python.class_({
            name: this.context.getPascalCaseSafeName(this.typeDeclaration.name.name),
            extends_: [python.reference({ name: "BaseModel", modulePath: ["pydantic"] })],
            decorators: []
        });

        for (const property of this.objectDeclaration.properties) {
            const propertyName = this.getPropertyName({
                className: this.context.getPascalCaseSafeName(this.typeDeclaration.name.name),
                objectProperty: property.name
            });

            const propertyType = this.context.pythonTypeMapper.convert({ reference: property.valueType });

            class_.addField(
                python.field({
                    name: propertyName,
                    type: propertyType,
                    initializer: this.context.isTypeReferenceOptional(property.valueType)
                        ? python.codeBlock("None")
                        : undefined
                })
            );
        }

        const module = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({
            moduleName: module.join("."),
            path: ["test"],
            name: filename
        });
        file.addStatement(class_);

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(module.join("/")),
            filename: filename
        });
    }

    /**
     * Class Names and Property Names cannot overlap in C# otherwise there are compilation errors.
     */
    private getPropertyName({
        className,
        objectProperty
    }: {
        className: string;
        objectProperty: NameAndWireValue;
    }): string {
        return this.context.getSnakeCaseSafeName(objectProperty.name);
    }
}
