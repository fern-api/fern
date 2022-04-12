package com.fern.model.codegen;

import com.fern.*;
import com.squareup.javapoet.JavaFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class ModelGenerator {

    public static List<JavaFile> generate(List<TypeDefinition> typeDefinitions) {
        Map<NamedTypeReference, TypeDefinition> typeDefinitionsByName = typeDefinitions.stream()
                .collect(Collectors.toUnmodifiableMap(TypeDefinition::name, Function.identity()));
        Map<NamedTypeReference, GeneratedInterface> generatedInterfaces = typeDefinitions.stream()
                .map(TypeDefinition::_extends)
                .flatMap(List::stream)
                .map(typeDefinitionsByName::get)
                .collect(Collectors.toMap(typeDefinition -> typeDefinition.name(), InterfaceGenerator::generate));
        List<GeneratedFile<?>> generatedFiles = typeDefinitions.stream()
                .map(typeDefinition -> typeDefinition.shape()
                        .accept(new TypeDefinitionGenerator(typeDefinition, generatedInterfaces, typeDefinitionsByName)))
                .collect(Collectors.toList());
        return generatedFiles.stream().map(GeneratedFile::file).collect(Collectors.toList());
    }

    private final static class TypeDefinitionGenerator implements Type.Visitor<GeneratedFile<?>> {

        private final TypeDefinition typeDefinition;
        private final Map<NamedTypeReference, GeneratedInterface> generatedInterfaces;
        private final Map<NamedTypeReference, TypeDefinition> typeDefinitionsByName;

        public TypeDefinitionGenerator(
                TypeDefinition typeDefinition,
                Map<NamedTypeReference, GeneratedInterface> generatedInterfaces,
                Map<NamedTypeReference, TypeDefinition> typeDefinitionsByName) {
            this.typeDefinition = typeDefinition;
            this.generatedInterfaces = generatedInterfaces;
            this.typeDefinitionsByName = typeDefinitionsByName;
        }

        @Override
        public GeneratedFile<?> visitObject(ObjectTypeDefinition objectTypeDefinition) {
            List<GeneratedInterface> superInterfaces = typeDefinition._extends().stream()
                    .map(generatedInterfaces::get)
                    .collect(Collectors.toList());
            if (generatedInterfaces.containsKey(typeDefinition.name())) {
                // Add own interface to super interfaces and ignoreOwnFields when generating object
                List<GeneratedInterface> superInterfacesWithOwnInterface = new ArrayList<>(superInterfaces);
                superInterfacesWithOwnInterface.add(generatedInterfaces.get(typeDefinition.name()));
                return ObjectGenerator.generate(
                        superInterfacesWithOwnInterface, typeDefinition.name(), objectTypeDefinition, true);
            } else {
                return ObjectGenerator.generate(
                        superInterfaces, typeDefinition.name(), objectTypeDefinition, false);
            }
        }

        @Override
        public GeneratedFile<?> visitUnion(UnionTypeDefinition unionTypeDefinition) {
            return UnionGenerator.generate(typeDefinition.name(), unionTypeDefinition, typeDefinitionsByName);
        }

        @Override
        public GeneratedFile<?> visitAlias(AliasTypeDefinition aliasTypeDefinition) {
            return null;
        }

        @Override
        public GeneratedFile<?> visitEnum(EnumTypeDefinition enumTypeDefinition) {
            return EnumGenerator.generate(typeDefinition.name(), enumTypeDefinition);
        }

        @Override
        public GeneratedFile<?> visitUnknown(String s) {
            throw new RuntimeException("Encountered unknown Type: " + s);
        }
    }
}
