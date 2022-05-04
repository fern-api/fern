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
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class ClientGeneratorCli {

    private static final String SRC_GENERATED_JAVA = "src/generated/java";

    private static final ObjectMapper OBJECT_MAPPER =
            new ObjectMapper().registerModule(new Jdk8Module().configureAbsentsAsNulls(true));

    private ClientGeneratorCli() {}

    public static void main(String... args) {
        String pluginPath = args[0];
        PluginConfig pluginConfig = getPluginConfig(pluginPath);
        IntermediateRepresentation ir = getIr(pluginConfig);
        generate(ir, pluginConfig);
    }

    private static PluginConfig getPluginConfig(String pluginPath) {
        try {
            return OBJECT_MAPPER.readValue(new File(pluginPath), PluginConfig.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read plugin configuration", e);
        }
    }

    private static IntermediateRepresentation getIr(PluginConfig pluginConfig) {
        try {
            return OBJECT_MAPPER.readValue(new File(pluginConfig.irFilepath()), IntermediateRepresentation.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ir", e);
        }
    }

    private static void generate(IntermediateRepresentation ir, PluginConfig pluginConfig) {
        Map<NamedType, TypeDefinition> typeDefinitionsByName =
                ir.types().stream().collect(Collectors.toUnmodifiableMap(TypeDefinition::name, Function.identity()));
        GeneratorContext generatorContext = new GeneratorContext(pluginConfig.packagePrefix(), typeDefinitionsByName);
        ModelGenerator modelGenerator = new ModelGenerator(ir.types(), ir.errors(), generatorContext);
        ModelGeneratorResult modelGeneratorResult = modelGenerator.generate();
        List<GeneratedHttpService> generatedHttpServices = ir.services().http().stream()
                .map(httpService -> {
                    HttpServiceGenerator httpServiceGenerator = new HttpServiceGenerator(
                            generatorContext,
                            modelGeneratorResult.interfaces(),
                            modelGeneratorResult.exceptions(),
                            httpService);
                    return httpServiceGenerator.generate();
                })
                .collect(Collectors.toList());
        List<GeneratedFile> generatedFiles = new ArrayList<>();
        generatedFiles.addAll(modelGeneratorResult.aliases());
        generatedFiles.addAll(modelGeneratorResult.enums());
        generatedFiles.addAll(modelGeneratorResult.interfaces().values());
        generatedFiles.addAll(modelGeneratorResult.objects());
        generatedFiles.addAll(modelGeneratorResult.unions());
        generatedFiles.addAll(modelGeneratorResult.exceptions());
        generatedFiles.add(generatorContext.getClientObjectMappersFile());
        generatedFiles.add(generatorContext.getStagedImmutablesFile());
        generatedFiles.add(generatorContext.getPackagePrivateImmutablesFile());
        generatedFiles.add(generatorContext.getAuthHeaderFile());
        generatedFiles.add(generatorContext.getApiExceptionFile());
        generatedFiles.add(generatorContext.getHttpApiExceptionFile());
        generatedFiles.add(generatorContext.getUnknownRemoteExceptionFile());
        generatedHttpServices.forEach(generatedHttpService -> {
            generatedFiles.add(generatedHttpService);
            generatedHttpService.generatedErrorDecoder().ifPresent(generatedFiles::add);
            generatedFiles.addAll(generatedHttpService.generatedWireMessages());
        });
        writeToFiles(generatedFiles, pluginConfig);
    }

    private static synchronized void writeToFiles(List<GeneratedFile> generatedFiles, PluginConfig pluginConfig) {
        Path srcPath = Paths.get(pluginConfig.outputDirectory(), SRC_GENERATED_JAVA);
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
