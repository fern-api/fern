package com.fern.model.codegen;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.guava.GuavaModule;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fern.IntermediateRepresentation;
import com.fern.model.codegen.config.PluginConfig;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import net.sourceforge.argparse4j.ArgumentParsers;
import net.sourceforge.argparse4j.inf.ArgumentParser;
import net.sourceforge.argparse4j.inf.ArgumentParserException;
import net.sourceforge.argparse4j.inf.Namespace;

public final class ModelGeneratorCli {

    private static final String PROGRAM_NAME = "Fern Java Model Generator Plugin";
    private static final String IR_ARG_NAME = "ir";
    private static final String OUTPUT_ARG_NAME = "output";

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new GuavaModule())
            .registerModule(new Jdk8Module().configureAbsentsAsNulls(true));

    private ModelGeneratorCli() {}

    public static void main(String... args) {
        ArgumentParser parser = ArgumentParsers.newFor(PROGRAM_NAME)
                .build()
                .defaultHelp(true)
                .description("Generates Java objects based on types in your Fern API spec.");
        parser.addArgument(IR_ARG_NAME).nargs(1).help("Filepath to Fern IR JSON (intermediate representation).");
        parser.addArgument(OUTPUT_ARG_NAME).nargs(1).help("Filepath for generated code");
        try {
            Namespace namespace = parser.parseArgs(args);
            String irLocation = ((List<String>) namespace.get(IR_ARG_NAME)).get(0);
            String outputDirectory = ((List<String>) namespace.get(OUTPUT_ARG_NAME)).get(0);
            PluginConfig pluginConfig = PluginConfig.builder()
                    .modelSubprojectDirectoryName(outputDirectory)
                    .packagePrefix("com")
                    .build();
            String irJson = Files.readString(new File(irLocation).toPath());
            IntermediateRepresentation intermediateRepresentation =
                    OBJECT_MAPPER.readValue(irJson, IntermediateRepresentation.class);
            ModelGenerator modelGenerator = new ModelGenerator(intermediateRepresentation.types(), pluginConfig);
            modelGenerator.buildModelSubproject();
        } catch (ArgumentParserException e) {
            parser.handleError(e);
            System.exit(1);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse Fern IR json", e);
        }
    }
}
