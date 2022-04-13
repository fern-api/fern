package com.fern.model.codegen;

import com.fern.AliasTypeDefinition;
import com.fern.EnumTypeDefinition;
import com.fern.ObjectTypeDefinition;
import com.fern.Type;
import com.fern.TypeDefinition;
import com.fern.UnionTypeDefinition;
import com.fern.model.codegen.utils.FilepathUtils;
import com.fern.model.codegen.utils.KeyWordUtils;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.stream.Collectors;

public class InterfaceGenerator {

    //    private static final Logger log = LoggerFactory.getLogger(InterfaceGenerator.class);
    private static final String INTERFACE_PREFIX = "I";

    private InterfaceGenerator() {}

    public static GeneratedInterface generate(TypeDefinition typeDefinition) {
        TypeSpec generatedInterface = TypeSpec.interfaceBuilder(
                        INTERFACE_PREFIX + typeDefinition.name().name())
                .addMethods(typeDefinition
                        .shape()
                        .accept(new InterfaceMethodGenerator(
                                typeDefinition.name().name())))
                .build();
        JavaFile interfaceFile = JavaFile.builder(
                        FilepathUtils.convertFilepathToPackage(
                                typeDefinition.name().filepath()),
                        generatedInterface)
                .build();
        return GeneratedInterface.builder()
                .file(interfaceFile)
                .definition(typeDefinition)
                .build();
    }

    private static final class InterfaceMethodGenerator implements Type.Visitor<List<MethodSpec>> {

        private final String typeName;

        private InterfaceMethodGenerator(String typeName) {
            this.typeName = typeName;
        }

        @Override
        public List<MethodSpec> visitObject(ObjectTypeDefinition objectTypeDefinition) {
            return objectTypeDefinition.fields().stream()
                    .map(field -> {
                        TypeName returnType = field.valueType().accept(TypeReferenceToTypeNameConverter.INSTANCE);
                        return KeyWordUtils.getKeyWordCompatibleImmutablesPropertyName(field.key(), returnType);
                    })
                    .collect(Collectors.toList());
        }

        @Override
        public List<MethodSpec> visitUnion(UnionTypeDefinition unionTypeDefinition) {
            throw new IllegalStateException(typeName + " extends an union which is not allowed");
        }

        @Override
        public List<MethodSpec> visitAlias(AliasTypeDefinition aliasTypeDefinition) {
            throw new IllegalStateException(typeName + " extends an alias which is not allowed");
        }

        @Override
        public List<MethodSpec> visitEnum(EnumTypeDefinition enumTypeDefinition) {
            throw new IllegalStateException(typeName + " extends an enum which is not allowed");
        }

        @Override
        public List<MethodSpec> visitUnknown(String unknownType) {
            throw new RuntimeException("Received unknown Type while building interface: " + unknownType);
        }
    }
}
