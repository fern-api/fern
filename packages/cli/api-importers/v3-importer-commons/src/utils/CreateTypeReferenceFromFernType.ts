import { recursivelyVisitRawTypeReference } from "@fern-api/fern-definition-schema";
import * as FernIr from "@fern-api/ir-sdk";

export function createTypeReferenceFromFernType(fernType: string): FernIr.TypeReference | undefined {
    return recursivelyVisitRawTypeReference<FernIr.TypeReference | undefined>({
        type: fernType,
        _default: undefined,
        validation: undefined,
        visitor: {
            primitive: (primitive) => {
                switch (primitive.v1) {
                    case "BASE_64":
                        return FernIr.TypeReference.primitive({
                            v1: "BASE_64",
                            v2: FernIr.PrimitiveTypeV2.base64({})
                        });
                    case "BOOLEAN":
                        return FernIr.TypeReference.primitive({
                            v1: "BOOLEAN",
                            v2: FernIr.PrimitiveTypeV2.boolean({
                                default: undefined
                            })
                        });
                    case "DATE":
                        return FernIr.TypeReference.primitive({
                            v1: "DATE",
                            v2: FernIr.PrimitiveTypeV2.date({})
                        });
                    case "DATE_TIME":
                        return FernIr.TypeReference.primitive({
                            v1: "DATE_TIME",
                            v2: FernIr.PrimitiveTypeV2.dateTime({})
                        });
                    case "FLOAT":
                        return FernIr.TypeReference.primitive({
                            v1: "FLOAT",
                            v2: FernIr.PrimitiveTypeV2.float({})
                        });
                    case "DOUBLE":
                        return FernIr.TypeReference.primitive({
                            v1: "DOUBLE",
                            v2: FernIr.PrimitiveTypeV2.double({
                                default: undefined,
                                validation: undefined
                            })
                        });
                    case "UINT":
                        return FernIr.TypeReference.primitive({
                            v1: "UINT",
                            v2: FernIr.PrimitiveTypeV2.uint({})
                        });
                    case "UINT_64":
                        return FernIr.TypeReference.primitive({
                            v1: "UINT_64",
                            v2: FernIr.PrimitiveTypeV2.uint64({})
                        });
                    case "INTEGER":
                        return FernIr.TypeReference.primitive({
                            v1: "INTEGER",
                            v2: FernIr.PrimitiveTypeV2.integer({
                                default: undefined,
                                validation: undefined
                            })
                        });
                    case "LONG":
                        return FernIr.TypeReference.primitive({
                            v1: "LONG",
                            v2: FernIr.PrimitiveTypeV2.long({
                                default: undefined
                            })
                        });
                    case "STRING":
                        return FernIr.TypeReference.primitive({
                            v1: "STRING",
                            v2: FernIr.PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        });
                    case "UUID":
                        return FernIr.TypeReference.primitive({
                            v1: "UUID",
                            v2: FernIr.PrimitiveTypeV2.uuid({})
                        });
                    case "BIG_INTEGER":
                        return FernIr.TypeReference.primitive({
                            v1: "BIG_INTEGER",
                            v2: FernIr.PrimitiveTypeV2.bigInteger({
                                default: undefined
                            })
                        });
                    default:
                        return undefined;
                }
            },
            unknown: () => {
                return FernIr.TypeReference.unknown();
            },
            map: ({ keyType, valueType }) => {
                if (keyType == null || valueType == null) {
                    return undefined;
                }
                return FernIr.TypeReference.container(
                    FernIr.ContainerType.map({
                        keyType,
                        valueType
                    })
                );
            },
            list: (itemType) => {
                if (itemType == null) {
                    return undefined;
                }
                return FernIr.TypeReference.container(
                    FernIr.ContainerType.list({
                        itemType,
                        validation: undefined
                    })
                );
            },
            optional: (itemType) => {
                if (itemType == null) {
                    return undefined;
                }
                return FernIr.TypeReference.container(FernIr.ContainerType.optional(itemType));
            },
            nullable: (itemType) => {
                if (itemType == null) {
                    return undefined;
                }
                return FernIr.TypeReference.container(FernIr.ContainerType.nullable(itemType));
            },
            set: (itemType) => {
                if (itemType == null) {
                    return undefined;
                }
                return FernIr.TypeReference.container(FernIr.ContainerType.set(itemType));
            },
            literal: (literal) => {
                return FernIr.TypeReference.container(
                    FernIr.ContainerType.literal(
                        literal._visit<FernIr.Literal>({
                            string: (value) => FernIr.Literal.string(value),
                            boolean: (value) => FernIr.Literal.boolean(value),
                            _other: () => {
                                throw new Error("Unexpected literal type");
                            }
                        })
                    )
                );
            },
            named: () => {
                return undefined;
            }
        }
    });
}
