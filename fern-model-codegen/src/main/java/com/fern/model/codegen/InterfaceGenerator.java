package com.fern.model.codegen;

import com.fern.*;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.lang.model.element.Modifier;
import java.util.List;
import java.util.stream.Collectors;

public class InterfaceGenerator {

    private static final Logger log = LoggerFactory.getLogger(InterfaceGenerator.class);
    private static final String INTERFACE_PREFIX = "I";

    public static GeneratedInterface generate(TypeDefinition typeDefinition) {
        TypeSpec generatedInterface = TypeSpec.interfaceBuilder(INTERFACE_PREFIX + typeDefinition.name().name())
                .addMethods(typeDefinition.shape().accept(new InterfaceMethodGenerator(typeDefinition.name().name())))
                .build();
        JavaFile interfaceFile = JavaFile.builder(typeDefinition.name()._package().orElse(""), generatedInterface)
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
                    .map(field -> MethodSpec.methodBuilder(field.key())
                            .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                            .returns(field.valueType().accept(TypeReferenceToTypeNameConverter.INSTANCE)).build())
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
        public List<MethodSpec> visitUnknown(String s) {
            throw new RuntimeException("Received unknown Type while building interface: " + s);
        }
    }
}
