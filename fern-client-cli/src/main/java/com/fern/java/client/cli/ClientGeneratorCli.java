package com.fern.java.client.cli;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fern.IntermediateRepresentation;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpService;
import com.fern.codegen.GeneratorContext;
import com.fern.model.codegen.ModelGenerator;
import com.fern.model.codegen.ModelGeneratorResult;
import com.fern.services.jersey.codegen.HttpServiceGenerator;
import com.squareup.javapoet.JavaFile;
import com.types.NamedType;
import com.types.TypeDefinition;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import net.sourceforge.argparse4j.ArgumentParsers;
import net.sourceforge.argparse4j.inf.ArgumentParser;
import net.sourceforge.argparse4j.inf.ArgumentParserException;
import net.sourceforge.argparse4j.inf.Namespace;

public final class ClientGeneratorCli {

    private static final String PROGRAM_NAME = "Fern Java Model Generator Plugin";
    private static final String IR_ARG_NAME = "ir";
    private static final String OUTPUT_DIRECTORY_ARG_NAME = "output";
    private static final String PACKAGE_PREFIX_ARG_NAME = "package_prefix";

    private static final String SRC_GENERATED_JAVA = "src/generated/java";

    private static final ObjectMapper OBJECT_MAPPER =
            new ObjectMapper().registerModule(new Jdk8Module().configureAbsentsAsNulls(true));

    private ClientGeneratorCli() {}

    public static void main(String... args) {
        ArgumentParser parser = ArgumentParsers.newFor(PROGRAM_NAME)
                .build()
                .defaultHelp(true)
                .description("Generates Java objects based on types in your Fern API spec.");
        parser.addArgument(IR_ARG_NAME).nargs(1).help("Filepath to Fern IR JSON (intermediate representation).");
        parser.addArgument(OUTPUT_DIRECTORY_ARG_NAME).nargs(1).help("Output directory for generated code");
        parser.addArgument(PACKAGE_PREFIX_ARG_NAME).nargs(1).help("Package prefix for generated code");
        try {
            Namespace namespace = parser.parseArgs(args);
            String irLocation = ((List<String>) namespace.get(IR_ARG_NAME)).get(0);
            String outputDirectory = ((List<String>) namespace.get(OUTPUT_DIRECTORY_ARG_NAME)).get(0);
            String packagePrefix = ((List<String>) namespace.get(PACKAGE_PREFIX_ARG_NAME)).get(0);
            PluginConfig pluginConfig = PluginConfig.builder()
                    .modelSubprojectDirectoryName(outputDirectory)
                    .packagePrefix(packagePrefix)
                    .build();
            String irJson = Files.readString(new File(irLocation).toPath());
            IntermediateRepresentation ir = OBJECT_MAPPER.readValue(irJson, IntermediateRepresentation.class);
            generate(ir, pluginConfig);
        } catch (ArgumentParserException e) {
            parser.handleError(e);
            System.exit(1);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse Fern IR json", e);
        }
    }

    private static void generate(IntermediateRepresentation ir, PluginConfig pluginConfig) {
        Map<NamedType, TypeDefinition> typeDefinitionsByName =
                ir.types().stream().collect(Collectors.toUnmodifiableMap(TypeDefinition::name, Function.identity()));
        GeneratorContext generatorContext = new GeneratorContext(pluginConfig.packagePrefix(), typeDefinitionsByName);
        ModelGenerator modelGenerator = new ModelGenerator(ir.types(), generatorContext);
        ModelGeneratorResult modelGeneratorResult = modelGenerator.generate();
        List<GeneratedHttpService> generatedHttpServices = ir.services().http().stream()
                .map(httpService -> {
                    HttpServiceGenerator httpServiceGenerator =
                            new HttpServiceGenerator(generatorContext, modelGeneratorResult.interfaces(), httpService);
                    return httpServiceGenerator.generate();
                })
                .collect(Collectors.toList());
        List<GeneratedFile> generatedFiles = new ArrayList<>();
        generatedFiles.addAll(modelGeneratorResult.aliases());
        generatedFiles.addAll(modelGeneratorResult.enums());
        generatedFiles.addAll(modelGeneratorResult.interfaces().values());
        generatedFiles.addAll(modelGeneratorResult.objects());
        generatedFiles.addAll(modelGeneratorResult.unions());
        generatedFiles.add(generatorContext.getClientObjectMappersFile());
        generatedFiles.add(generatorContext.getStagedImmutablesFile());
        generatedFiles.add(generatorContext.getPackagePrivateImmutablesFile());
        generatedFiles.add(generatorContext.getAuthHeaderFile());
        generatedHttpServices.forEach(generatedHttpService -> {
            generatedFiles.add(generatedHttpService);
            generatedFiles.addAll(generatedHttpService.generatedWireMessages());
        });
        writeToFiles(generatedFiles, pluginConfig);
    }

    private static synchronized void writeToFiles(List<GeneratedFile> generatedFiles, PluginConfig pluginConfig) {
        Path srcPath = Paths.get(pluginConfig.modelSubprojectDirectoryName(), SRC_GENERATED_JAVA);
        generatedFiles.forEach(generatedFile -> {
            JavaFile javaFile = generatedFile.file();
            try {
                javaFile.writeToFile(srcPath.toFile());
            } catch (IOException e) {
                throw new RuntimeException("Failed to write generated java file: " + javaFile.typeSpec.name, e);
            }
        });
    }
}
