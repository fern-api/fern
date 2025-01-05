import { WriteablePythonFile, core, dt, pydantic } from "@fern-api/base-python-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";

import { AliasTypeDeclaration, PrimitiveTypeV1, TypeDeclaration, TypeId, TypeReference } from "@fern-fern/ir-sdk/api";

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";

export class WrappedAliasGenerator {
    private readonly className: string;

    constructor(
        private readonly typeId: TypeId,
        private readonly context: PydanticModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly aliasDeclaration: AliasTypeDeclaration
    ) {
        this.className = this.context.getClassName(this.typeDeclaration.name.name);
    }

    public doGenerate(): WriteablePythonFile {
        const valueType = this.context.pythonTypeMapper.convert({ reference: this.aliasDeclaration.aliasOf });

        const class_ = python.class_({
            name: this.className,
            docs: this.typeDeclaration.docs,
            extends_: [pydantic.RootModel(valueType)],
            decorators: []
        });

        class_.addField(
            python.field({
                name: "root",
                type: valueType,
                docs: undefined,
                initializer: undefined
            })
        );

        class_.add(this.getGetterMethod());

        class_.add(this.getBuilderMethod());

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

    private getGetterMethod(): python.Method {
        const method = python.method({
            name: this.getGetterName(this.aliasDeclaration.aliasOf),
            return_: python.Type.uuid()
        });
        method.addStatement(python.codeBlock("return self.root"));
        return method;
    }

    private getGetterName(typeReference: TypeReference): string {
        return typeReference._visit({
            container: (container) =>
                container._visit({
                    list: () => "get_as_list",
                    map: () => "get_as_map",
                    set: () => "get_as_set",
                    optional: (opt) => this.getGetterName(opt),
                    literal: () => "get_as_string",
                    _other: () => "get_value"
                }),
            named: (typeName) => "get_as_" + typeName.name.snakeCase.unsafeName,
            primitive: (primitive) => {
                if (primitive.v2 != null) {
                    return primitive.v2?._visit({
                        integer: () => "get_as_int",
                        double: () => "get_as_float",
                        string: () => "get_as_str",
                        boolean: () => "get_as_bool",
                        long: () => "get_as_int",
                        dateTime: () => "get_as_datetime",
                        date: () => "get_as_date",
                        uuid: () => "get_as_uuid",
                        base64: () => "get_as_str",
                        bigInteger: () => "get_as_str",
                        uint: () => "get_as_int",
                        uint64: () => "get_as_int",
                        float: () => "get_as_float",
                        _other: () => "get_value"
                    });
                }
                switch (primitive.v1) {
                    case PrimitiveTypeV1.Integer:
                        return "get_as_int";
                    case PrimitiveTypeV1.Double:
                        return "get_as_float";
                    case PrimitiveTypeV1.String:
                        return "get_as_str";
                    case PrimitiveTypeV1.Boolean:
                        return "get_as_bool";
                    case PrimitiveTypeV1.Long:
                        return "get_as_int";
                    case PrimitiveTypeV1.DateTime:
                        return "get_as_datetime";
                    case PrimitiveTypeV1.Date:
                        return "get_as_date";
                    case PrimitiveTypeV1.Uuid:
                        return "get_as_uuid";
                    case PrimitiveTypeV1.Base64:
                        return "get_as_str";
                    case PrimitiveTypeV1.BigInteger:
                        return "get_as_str";
                    case PrimitiveTypeV1.Uint:
                        return "get_as_int";
                    case PrimitiveTypeV1.Uint64:
                        return "get_as_int";
                    case PrimitiveTypeV1.Float:
                        return "get_as_float";
                    default:
                        assertNever(primitive.v1);
                }
            },
            unknown: () => "get_value",
            _other: () => "get_value"
        });
    }

    private getBuilderMethod(): python.Method {
        const method = python.method({
            name: this.getBuilderName(this.aliasDeclaration.aliasOf),
            static_: true,
            parameters: [
                python.parameter({
                    name: "value",
                    type: this.context.pythonTypeMapper.convert({ reference: this.aliasDeclaration.aliasOf })
                })
            ],
            return_: python.Type.reference(
                new python.Reference({
                    name: this.className
                })
            )
        });
        method.addStatement(
            python.codeBlock((writer) => {
                writer.write(`${this.className}(root=value)`);
            })
        );
        return method;
    }

    private getBuilderName(typeReference: TypeReference): string {
        return typeReference._visit({
            container: (container) =>
                container._visit({
                    list: () => "from_list",
                    map: () => "from_map",
                    set: () => "from_set",
                    optional: (opt) => this.getBuilderName(opt),
                    literal: () => "from_string",
                    _other: () => "from_value"
                }),
            named: (typeName) => "from_" + typeName.name.snakeCase.unsafeName,
            primitive: (primitive) => {
                if (primitive.v2 != null) {
                    return primitive.v2?._visit({
                        integer: () => "from_int",
                        double: () => "from_float",
                        string: () => "from_str",
                        boolean: () => "from_bool",
                        long: () => "from_int",
                        dateTime: () => "from_datetime",
                        date: () => "from_date",
                        uuid: () => "from_uuid",
                        base64: () => "from_str",
                        bigInteger: () => "from_str",
                        uint: () => "from_int",
                        uint64: () => "from_int",
                        float: () => "from_float",
                        _other: () => "from_value"
                    });
                }
                switch (primitive.v1) {
                    case PrimitiveTypeV1.Integer:
                        return "from_int";
                    case PrimitiveTypeV1.Double:
                        return "from_float";
                    case PrimitiveTypeV1.String:
                        return "from_str";
                    case PrimitiveTypeV1.Boolean:
                        return "from_bool";
                    case PrimitiveTypeV1.Long:
                        return "from_int";
                    case PrimitiveTypeV1.DateTime:
                        return "from_datetime";
                    case PrimitiveTypeV1.Date:
                        return "from_date";
                    case PrimitiveTypeV1.Uuid:
                        return "from_uuid";
                    case PrimitiveTypeV1.Base64:
                        return "from_str";
                    case PrimitiveTypeV1.BigInteger:
                        return "from_str";
                    case PrimitiveTypeV1.Uint:
                        return "from_int";
                    case PrimitiveTypeV1.Uint64:
                        return "from_int";
                    case PrimitiveTypeV1.Float:
                        return "from_float";
                    default:
                        assertNever(primitive.v1);
                }
            },
            unknown: () => "from_value",
            _other: () => "from_value"
        });
    }
}
