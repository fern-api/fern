import { WriteablePythonFile, core, dt, pydantic } from "@fern-api/base-python-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";

import { NameAndWireValue, ObjectTypeDeclaration, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";

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
            docs: this.typeDeclaration.docs,
            extends_: [
                pydantic.BaseModel,
                ...this.objectDeclaration.extends.map((extend) => {
                    return this.context.pythonTypeMapper.convertToClassReference({
                        typeId: extend.typeId,
                        name: extend.name
                    });
                })
            ],
            decorators: []
        });

        for (const property of this.objectDeclaration.properties) {
            const propertyName = this.getPropertyName({
                className: this.context.getPascalCaseSafeName(this.typeDeclaration.name.name),
                objectProperty: property.name
            });

            const propertyType = this.context.pythonTypeMapper.convert({ reference: property.valueType });

            const value = this.context.isTypeReferenceOptional(property.valueType)
                ? python.codeBlock("None")
                : undefined;

            const wireValue = propertyName === property.name.wireValue ? undefined : property.name.wireValue;

            let initializer = undefined;

            if (value != null && wireValue == null) {
                initializer = value;
            } else if (wireValue != null || value != null) {
                // TODO(dsinghvi): uncomment after redoing imports
                python.codeBlock((writer) => {
                    const arguments_: python.MethodArgument[] = [];
                    if (wireValue != null) {
                        arguments_.push(
                            python.methodArgument({
                                name: "alias",
                                value: python.codeBlock(`"${wireValue}"`)
                            })
                        );
                    }
                    if (value != null) {
                        arguments_.push(
                            python.methodArgument({
                                name: "default",
                                value
                            })
                        );
                    }
                    // writer.writeNode(
                    //     python.instantiateClass({
                    //         classReference: pydantic.Field,
                    //         arguments_
                    //     })
                    // );
                });
            }

            class_.addField(
                python.field({
                    name: propertyName,
                    type: propertyType,
                    docs: property.docs,
                    initializer
                })
            );
        }

        class_.add(this.getConfigClass());

        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });
        file.addStatement(class_);

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(path.join("/")),
            filename
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

    private getConfigClass(): python.Class {
        const configClass = python.class_({
            name: "Config"
        });

        configClass.addField(
            python.field({
                name: "frozen",
                initializer: python.TypeInstantiation.bool(true)
            })
        );

        configClass.addField(
            python.field({
                name: "smart_union",
                initializer: python.TypeInstantiation.bool(true)
            })
        );

        configClass.addField(
            python.field({
                name: "json_encoders",
                initializer: python.TypeInstantiation.dict([
                    {
                        key: dt.datetime,
                        value: core.serialize_datetime
                    }
                ])
            })
        );

        return configClass;
    }
}
