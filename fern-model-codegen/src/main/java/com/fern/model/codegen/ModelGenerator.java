package com.fern.model.codegen;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.IGeneratedFile;
import com.fern.model.codegen.alias.AliasGenerator;
import com.fern.model.codegen.config.PluginConfig;
import com.fern.model.codegen.enums.EnumGenerator;
import com.fern.model.codegen.interfaces.GeneratedInterface;
import com.fern.model.codegen.interfaces.InterfaceGenerator;
import com.fern.model.codegen.object.ObjectGenerator;
import com.fern.model.codegen.union.UnionGenerator;
import com.google.common.collect.Streams;
import com.squareup.javapoet.JavaFile;
import com.types.AliasTypeDefinition;
import com.types.EnumTypeDefinition;
import com.types.NamedType;
import com.types.ObjectTypeDefinition;
import com.types.Type;
import com.types.TypeDefinition;
import com.types.UnionTypeDefinition;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ModelGenerator {

    private static final Logger log = LoggerFactory.getLogger(ModelGenerator.class);

    private static final String SRC_MAIN_JAVA = "src/main/java";

    private final List<TypeDefinition> typeDefinitions;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;
    private final PluginConfig pluginConfig;
    private final GeneratorContext generatorContext;

    public ModelGenerator(List<TypeDefinition> typeDefinitions, PluginConfig pluginConfig) {
        this.typeDefinitions = typeDefinitions;
        this.typeDefinitionsByName = typeDefinitions.stream()
                .collect(Collectors.toUnmodifiableMap(TypeDefinition::name, Function.identity()));
        this.pluginConfig = pluginConfig;
        this.generatorContext = new GeneratorContext(pluginConfig, typeDefinitionsByName);
    }

    public synchronized void buildModelSubproject() {
        Set<String> javaFilePaths = new HashSet<>();
        List<JavaFile> javaFiles = generateJavaFiles();
        Path srcPath = Paths.get(pluginConfig.modelSubprojectDirectoryName(), SRC_MAIN_JAVA);
        javaFiles.forEach(javaFile -> {
            try {
                File writtenFile = javaFile.writeToFile(srcPath.toFile());
                javaFilePaths.add(writtenFile.toPath().toString());
            } catch (IOException e) {
                throw new RuntimeException("Failed to write generated java file: " + javaFile.typeSpec.name, e);
            }
        });
        try {
            List<String> command = new ArrayList<>();
            command.addAll(List.of(
                    "javac",
                    "-cp",
                    System.getProperty("java.class.path"),
                    "-processor",
                    "org.immutables.value.processor.Processor",
                    "-s",
                    pluginConfig.modelSubprojectDirectoryName() + "/generatedSrc",
                    "-d",
                    pluginConfig.modelSubprojectDirectoryName() + "/build/classes"));
            command.addAll(javaFilePaths);
            log.debug("Running annotation processor {}", command);
            Process proc = Runtime.getRuntime().exec(command.toArray(new String[0]));
            StreamGobbler errorGobbler = new StreamGobbler(proc.getErrorStream());
            StreamGobbler outputGobbler = new StreamGobbler(proc.getInputStream());
            errorGobbler.start();
            outputGobbler.start();
            proc.waitFor();
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to generate cli");
        }
    }

    private static class StreamGobbler extends Thread {
        private final InputStream is;

        // reads everything from is until empty.
        StreamGobbler(InputStream is) {
            this.is = is;
        }

        public void run() {
            try {
                InputStreamReader isr = new InputStreamReader(is);
                BufferedReader br = new BufferedReader(isr);
                String line = null;
                while ((line = br.readLine()) != null) {
                    log.info(line);
                }
            } catch (IOException ioe) {
                log.error("Encountered exception while running annotation procesor", ioe);
            }
        }
    }

    private List<JavaFile> generateJavaFiles() {
        Map<NamedType, GeneratedInterface> generatedInterfaces = getGeneratedInterfaces();
        List<GeneratedFile> generatedFiles = typeDefinitions.stream()
                .map(typeDefinition ->
                        typeDefinition.shape().accept(new TypeDefinitionGenerator(typeDefinition, generatedInterfaces)))
                .collect(Collectors.toList());
        return Streams.concat(
                        generatedInterfaces.values().stream(),
                        generatedFiles.stream(),
                        Stream.of(generatorContext.getStagedImmutablesFile()))
                .map(IGeneratedFile::file)
                .collect(Collectors.toList());
    }

    private Map<NamedType, GeneratedInterface> getGeneratedInterfaces() {
        Set<NamedType> interfaceCandidates = typeDefinitions.stream()
                .map(TypeDefinition::shape)
                .map(Type::getObject)
                .flatMap(Optional::stream)
                .map(ObjectTypeDefinition::_extends)
                .flatMap(List::stream)
                .collect(Collectors.toSet());
        return interfaceCandidates.stream().collect(Collectors.toMap(Function.identity(), namedType -> {
            TypeDefinition typeDefinition = typeDefinitionsByName.get(namedType);
            ObjectTypeDefinition objectTypeDefinition = typeDefinition
                    .shape()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Non-objects cannot be extended. Fix type "
                            + typeDefinition.name().name() + " located in file"
                            + typeDefinition.name().fernFilepath()));
            InterfaceGenerator interfaceGenerator =
                    new InterfaceGenerator(objectTypeDefinition, namedType, generatorContext);
            return interfaceGenerator.generate();
        }));
    }

    private final class TypeDefinitionGenerator implements Type.Visitor<GeneratedFile> {

        private final TypeDefinition typeDefinition;
        private final Map<NamedType, GeneratedInterface> generatedInterfaces;

        TypeDefinitionGenerator(TypeDefinition typeDefinition, Map<NamedType, GeneratedInterface> generatedInterfaces) {
            this.typeDefinition = typeDefinition;
            this.generatedInterfaces = generatedInterfaces;
        }

        @Override
        public GeneratedFile visitObject(ObjectTypeDefinition objectTypeDefinition) {
            Optional<GeneratedInterface> selfInterface =
                    Optional.ofNullable(generatedInterfaces.get(typeDefinition.name()));
            List<GeneratedInterface> extendedInterfaces = objectTypeDefinition._extends().stream()
                    .map(generatedInterfaces::get)
                    .sorted(Comparator.comparing(
                            generatedInterface -> generatedInterface.className().simpleName()))
                    .collect(Collectors.toList());
            ObjectGenerator objectGenerator = new ObjectGenerator(
                    typeDefinition.name(), objectTypeDefinition, extendedInterfaces, selfInterface, generatorContext);
            return objectGenerator.generate();
        }

        @Override
        public GeneratedFile visitUnion(UnionTypeDefinition unionTypeDefinition) {
            UnionGenerator unionGenerator =
                    new UnionGenerator(typeDefinition.name(), unionTypeDefinition, generatorContext);
            return unionGenerator.generate();
        }

        @Override
        public GeneratedFile visitAlias(AliasTypeDefinition aliasTypeDefinition) {
            AliasGenerator aliasGenerator =
                    new AliasGenerator(aliasTypeDefinition, typeDefinition.name(), generatorContext);
            return aliasGenerator.generate();
        }

        @Override
        public GeneratedFile visitEnum(EnumTypeDefinition enumTypeDefinition) {
            EnumGenerator enumGenerator =
                    new EnumGenerator(typeDefinition.name(), enumTypeDefinition, generatorContext);
            return enumGenerator.generate();
        }

        @Override
        public GeneratedFile visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown Type: " + unknownType);
        }
    }
}
