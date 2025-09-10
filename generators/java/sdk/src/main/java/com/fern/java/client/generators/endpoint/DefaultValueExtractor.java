package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.AliasTypeDeclaration;
import com.fern.ir.model.types.BigIntegerType;
import com.fern.ir.model.types.BooleanType;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DoubleType;
import com.fern.ir.model.types.IntegerType;
import com.fern.ir.model.types.LongType;
import com.fern.ir.model.types.MapType;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.PrimitiveTypeV2;
import com.fern.ir.model.types.StringType;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.squareup.javapoet.CodeBlock;
import java.util.Optional;

/** Utility class to detect and extract default values from PrimitiveTypeV2 types. */
public final class DefaultValueExtractor {

    private final ClientGeneratorContext context;

    public DefaultValueExtractor(ClientGeneratorContext context) {
        this.context = context;
    }

    public boolean hasDefaultValue(TypeReference typeReference) {
        // Check if the feature is enabled
        if (!context.getCustomConfig().useDefaultRequestParameterValues()) {
            return false;
        }
        return hasDefaultValueInternal(typeReference);
    }

    private boolean hasDefaultValueInternal(TypeReference typeReference) {
        return typeReference.visit(new TypeReference.Visitor<Boolean>() {
            @Override
            public Boolean visitPrimitive(PrimitiveType primitive) {
                return primitive
                        .getV2()
                        .map(v2 -> v2.visit(new HasDefaultValueVisitor()))
                        .orElse(false);
            }

            @Override
            public Boolean visitContainer(ContainerType container) {
                return container.visit(new ContainerType.Visitor<Boolean>() {
                    @Override
                    public Boolean visitOptional(TypeReference optional) {
                        return hasDefaultValueInternal(optional);
                    }

                    @Override
                    public Boolean visitList(TypeReference itemType) {
                        return false;
                    }

                    @Override
                    public Boolean visitSet(TypeReference itemType) {
                        return false;
                    }

                    @Override
                    public Boolean visitMap(MapType map) {
                        return false;
                    }

                    @Override
                    public Boolean visitLiteral(com.fern.ir.model.types.Literal literal) {
                        return false;
                    }

                    @Override
                    public Boolean visitNullable(TypeReference nullable) {
                        return hasDefaultValueInternal(nullable);
                    }

                    @Override
                    public Boolean _visitUnknown(Object unknown) {
                        return false;
                    }
                });
            }

            @Override
            public Boolean visitNamed(NamedType namedType) {
                TypeId typeId = namedType.getTypeId();
                TypeDeclaration typeDeclaration = context.getTypeDeclarations().get(typeId);
                if (typeDeclaration != null && typeDeclaration.getShape().isAlias()) {
                    AliasTypeDeclaration alias =
                            typeDeclaration.getShape().getAlias().get();
                    return hasDefaultValueInternal(alias.getAliasOf());
                }
                return false;
            }

            @Override
            public Boolean visitUnknown() {
                return false;
            }

            @Override
            public Boolean _visitUnknown(Object unknown) {
                return false;
            }
        });
    }

    public Optional<CodeBlock> extractDefaultValue(TypeReference typeReference) {
        if (!hasDefaultValue(typeReference)) {
            return Optional.empty();
        }

        return extractDefaultValueInternal(typeReference);
    }

    private Optional<CodeBlock> extractDefaultValueInternal(TypeReference typeReference) {
        return typeReference.visit(new TypeReference.Visitor<Optional<CodeBlock>>() {
            @Override
            public Optional<CodeBlock> visitPrimitive(PrimitiveType primitive) {
                return primitive.getV2().flatMap(v2 -> v2.visit(new ExtractDefaultValueVisitor()));
            }

            @Override
            public Optional<CodeBlock> visitContainer(ContainerType container) {
                return container.visit(new ContainerType.Visitor<Optional<CodeBlock>>() {
                    @Override
                    public Optional<CodeBlock> visitOptional(TypeReference optional) {
                        return extractDefaultValueInternal(optional);
                    }

                    @Override
                    public Optional<CodeBlock> visitList(TypeReference itemType) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<CodeBlock> visitSet(TypeReference itemType) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<CodeBlock> visitMap(MapType map) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<CodeBlock> visitLiteral(com.fern.ir.model.types.Literal literal) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<CodeBlock> visitNullable(TypeReference nullable) {
                        return extractDefaultValueInternal(nullable);
                    }

                    @Override
                    public Optional<CodeBlock> _visitUnknown(Object unknown) {
                        return Optional.empty();
                    }
                });
            }

            @Override
            public Optional<CodeBlock> visitNamed(NamedType namedType) {
                TypeId typeId = namedType.getTypeId();
                TypeDeclaration typeDeclaration = context.getTypeDeclarations().get(typeId);
                if (typeDeclaration != null && typeDeclaration.getShape().isAlias()) {
                    AliasTypeDeclaration alias =
                            typeDeclaration.getShape().getAlias().get();
                    return extractDefaultValueInternal(alias.getAliasOf());
                }
                return Optional.empty();
            }

            @Override
            public Optional<CodeBlock> visitUnknown() {
                return Optional.empty();
            }

            @Override
            public Optional<CodeBlock> _visitUnknown(Object unknown) {
                return Optional.empty();
            }
        });
    }

    private static class HasDefaultValueVisitor implements PrimitiveTypeV2.Visitor<Boolean> {
        @Override
        public Boolean visitInteger(IntegerType integerType) {
            return integerType.getDefault().isPresent();
        }

        @Override
        public Boolean visitLong(LongType longType) {
            return longType.getDefault().isPresent();
        }

        @Override
        public Boolean visitDouble(DoubleType doubleType) {
            return doubleType.getDefault().isPresent();
        }

        @Override
        public Boolean visitBoolean(BooleanType booleanType) {
            return booleanType.getDefault().isPresent();
        }

        @Override
        public Boolean visitString(StringType stringType) {
            return stringType.getDefault().isPresent();
        }

        @Override
        public Boolean visitBigInteger(BigIntegerType bigIntegerType) {
            return bigIntegerType.getDefault().isPresent();
        }

        // Float, Uint, Uint64, Date, DateTime, UUID, Base64 don't support defaults in our IR version
        @Override
        public Boolean visitFloat(com.fern.ir.model.types.FloatType floatType) {
            return false;
        }

        @Override
        public Boolean visitUint(com.fern.ir.model.types.UintType uintType) {
            return false;
        }

        @Override
        public Boolean visitUint64(com.fern.ir.model.types.Uint64Type uint64Type) {
            return false;
        }

        @Override
        public Boolean visitDate(com.fern.ir.model.types.DateType dateType) {
            return false;
        }

        @Override
        public Boolean visitDateTime(com.fern.ir.model.types.DateTimeType dateTimeType) {
            return false;
        }

        @Override
        public Boolean visitUuid(com.fern.ir.model.types.UuidType uuidType) {
            return false;
        }

        @Override
        public Boolean visitBase64(com.fern.ir.model.types.Base64Type base64Type) {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object unknown) {
            return false;
        }
    }

    private static class ExtractDefaultValueVisitor implements PrimitiveTypeV2.Visitor<Optional<CodeBlock>> {
        @Override
        public Optional<CodeBlock> visitInteger(IntegerType integerType) {
            return integerType.getDefault().map(defaultValue -> CodeBlock.of("$L", defaultValue));
        }

        @Override
        public Optional<CodeBlock> visitLong(LongType longType) {
            return longType.getDefault().map(defaultValue -> CodeBlock.of("$LL", defaultValue));
        }

        @Override
        public Optional<CodeBlock> visitDouble(DoubleType doubleType) {
            return doubleType.getDefault().map(defaultValue -> CodeBlock.of("$L", defaultValue));
        }

        @Override
        public Optional<CodeBlock> visitBoolean(BooleanType booleanType) {
            return booleanType.getDefault().map(defaultValue -> CodeBlock.of("$L", defaultValue));
        }

        @Override
        public Optional<CodeBlock> visitString(StringType stringType) {
            return stringType.getDefault().map(defaultValue -> CodeBlock.of("$S", defaultValue));
        }

        @Override
        public Optional<CodeBlock> visitBigInteger(BigIntegerType bigIntegerType) {
            return bigIntegerType
                    .getDefault()
                    .map(defaultValue -> CodeBlock.of("new $T($S)", java.math.BigInteger.class, defaultValue));
        }

        // Float, Uint, Uint64 don't support defaults in our IR version
        @Override
        public Optional<CodeBlock> visitFloat(com.fern.ir.model.types.FloatType floatType) {
            return Optional.empty();
        }

        @Override
        public Optional<CodeBlock> visitUint(com.fern.ir.model.types.UintType uintType) {
            return Optional.empty();
        }

        @Override
        public Optional<CodeBlock> visitUint64(com.fern.ir.model.types.Uint64Type uint64Type) {
            return Optional.empty();
        }

        @Override
        public Optional<CodeBlock> visitDate(com.fern.ir.model.types.DateType dateType) {
            return Optional.empty();
        }

        @Override
        public Optional<CodeBlock> visitDateTime(com.fern.ir.model.types.DateTimeType dateTimeType) {
            return Optional.empty();
        }

        @Override
        public Optional<CodeBlock> visitUuid(com.fern.ir.model.types.UuidType uuidType) {
            return Optional.empty();
        }

        @Override
        public Optional<CodeBlock> visitBase64(com.fern.ir.model.types.Base64Type base64Type) {
            return Optional.empty();
        }

        @Override
        public Optional<CodeBlock> _visitUnknown(Object unknown) {
            return Optional.empty();
        }
    }
}
