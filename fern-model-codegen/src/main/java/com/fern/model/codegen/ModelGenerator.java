package com.fern.model.codegen;

import com.fern.AliasTypeDefinition;
import com.fern.EnumTypeDefinition;
import com.fern.NamedTypeReference;
import com.fern.ObjectTypeDefinition;
import com.fern.Type;
import com.fern.TypeDefinition;
import com.fern.UnionTypeDefinition;
import com.fern.model.codegen.alias.AliasGenerator;
import com.fern.model.codegen.config.PluginConfig;
import com.fern.model.codegen.enums.EnumGenerator;
import com.fern.model.codegen.interfaces.GeneratedInterface;
import com.fern.model.codegen.interfaces.InterfaceGenerator;
import com.fern.model.codegen.object.ObjectGenerator;
import com.fern.model.codegen.union.UnionGenerator;
import com.google.common.collect.Streams;
import com.squareup.javapoet.JavaFile;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class ModelGenerator {

    private static final String SRC_MAIN_JAVA = "src/main/java";

    private final List<TypeDefinition> typeDefinitions;
    private final Map<NamedTypeReference, TypeDefinition> typeDefinitionsByName;
    private final PluginConfig pluginConfig;
    private final GeneratorContext generatorContext;

    public ModelGenerator(List<TypeDefinition> typeDefinitions, PluginConfig pluginConfig) {
        this.typeDefinitions = typeDefinitions;
        this.typeDefinitionsByName = typeDefinitions.stream()
                .collect(Collectors.toUnmodifiableMap(TypeDefinition::name, Function.identity()));
        this.pluginConfig = pluginConfig;
        this.generatorContext = new GeneratorContext(pluginConfig, typeDefinitionsByName);
    }

    public void buildModelSubproject() {
        List<JavaFile> javaFiles = generateJavaFiles();
        javaFiles.forEach(javaFile -> {
            try {
                Path javaFilePath = Paths.get(pluginConfig.modelSubprojectDirectoryName(), SRC_MAIN_JAVA);
                javaFile.writeToFile(javaFilePath.toFile());
            } catch (IOException e) {
                throw new RuntimeException("Failed to write generated java file: " + javaFile.typeSpec.name, e);
            }
        });
    }

    private List<JavaFile> generateJavaFiles() {
        Map<NamedTypeReference, GeneratedInterface> generatedInterfaces = getGeneratedInterfaces();
        List<GeneratedFile<?>> generatedFiles = typeDefinitions.stream()
                .map(typeDefinition ->
                        typeDefinition.shape().accept(new TypeDefinitionGenerator(typeDefinition, generatedInterfaces)))
                .collect(Collectors.toList());
        return Streams.concat(generatedInterfaces.values().stream(), generatedFiles.stream())
                .map(GeneratedFile::file)
                .collect(Collectors.toList());
    }

    private Map<NamedTypeReference, GeneratedInterface> getGeneratedInterfaces() {
        Set<NamedTypeReference> interfaceCandidates = typeDefinitions.stream()
                .map(TypeDefinition::_extends)
                .flatMap(List::stream)
                .collect(Collectors.toSet());
        return interfaceCandidates.stream().collect(Collectors.toMap(Function.identity(), namedTypeReference -> {
            TypeDefinition typeDefinition = typeDefinitionsByName.get(namedTypeReference);
            ObjectTypeDefinition objectTypeDefinition = typeDefinition
                    .shape()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Non-objects cannot be extended. Fix type "
                            + typeDefinition.name().name() + " located in file"
                            + typeDefinition.name().filepath()));
            InterfaceGenerator interfaceGenerator =
                    new InterfaceGenerator(objectTypeDefinition, namedTypeReference, generatorContext);
            return interfaceGenerator.generate();
        }));
    }

    private final class TypeDefinitionGenerator implements Type.Visitor<GeneratedFile<?>> {

        private final TypeDefinition typeDefinition;
        private final Map<NamedTypeReference, GeneratedInterface> generatedInterfaces;

        TypeDefinitionGenerator(
                TypeDefinition typeDefinition, Map<NamedTypeReference, GeneratedInterface> generatedInterfaces) {
            this.typeDefinition = typeDefinition;
            this.generatedInterfaces = generatedInterfaces;
        }

        @Override
        public GeneratedFile<?> visitObject(ObjectTypeDefinition objectTypeDefinition) {
            Optional<GeneratedInterface> selfInterface =
                    Optional.ofNullable(generatedInterfaces.get(typeDefinition.name()));
            ObjectGenerator objectGenerator = new ObjectGenerator(
                    typeDefinition.name(),
                    objectTypeDefinition,
                    new ArrayList<>(generatedInterfaces.values()),
                    selfInterface,
                    generatorContext);
            return objectGenerator.generate();
        }

        @Override
        public GeneratedFile<?> visitUnion(UnionTypeDefinition unionTypeDefinition) {
            UnionGenerator unionGenerator =
                    new UnionGenerator(typeDefinition.name(), unionTypeDefinition, generatorContext);
            return unionGenerator.generate();
        }

        @Override
        public GeneratedFile<?> visitAlias(AliasTypeDefinition aliasTypeDefinition) {
            AliasGenerator aliasGenerator =
                    new AliasGenerator(aliasTypeDefinition, typeDefinition.name(), generatorContext);
            return aliasGenerator.generate();
        }

        @Override
        public GeneratedFile<?> visitEnum(EnumTypeDefinition enumTypeDefinition) {
            EnumGenerator enumGenerator =
                    new EnumGenerator(typeDefinition.name(), enumTypeDefinition, generatorContext);
            return enumGenerator.generate();
        }

        @Override
        public GeneratedFile<?> visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown Type: " + unknownType);
        }
    }
}
