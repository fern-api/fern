package com.fern.java.spring;

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.ir.core.ObjectMappers;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.ir.ErrorDiscriminationByPropertyStrategy;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.FeatureResolver;
import com.fern.java.generators.AuthGenerator;
import com.fern.java.generators.DateTimeDeserializerGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.output.gradle.AbstractGradleDependency;
import com.fern.java.output.gradle.GradleDependencyType;
import com.fern.java.output.gradle.ParsedGradleDependency;
import com.fern.java.spring.generators.ApiExceptionGenerator;
import com.fern.java.spring.generators.ErrorBodyGenerator;
import com.fern.java.spring.generators.ExceptionGenerator;
import com.fern.java.spring.generators.OptionalNullableGenerator;
import com.fern.java.spring.generators.SpringServerInterfaceGenerator;
import com.palantir.common.streams.KeyedStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class Cli extends AbstractGeneratorCli<SpringCustomConfig, SpringCustomConfig> {

    private static final Logger log = LoggerFactory.getLogger(Cli.class);

    private final List<String> subprojects = new ArrayList<>();

    @Override
    public void runV2Generator(DefaultGeneratorExecClient defaultGeneratorExecClient, String[] args) {
        // V2 is not yet supported for the spring generator
    }

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            SpringCustomConfig customConfig) {
        SpringGeneratorContext context = new SpringGeneratorContext(
                ir,
                generatorConfig,
                customConfig,
                new FeatureResolver(ir, generatorConfig, generatorExecClient).getResolvedAuthSchemes());
        generateClient(context, ir);
    }

    @Override
    public void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            SpringCustomConfig customConfig,
            GithubOutputMode githubOutputMode) {
        throw new RuntimeException("Github mode is unsupported!");
    }

    @Override
    public void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            SpringCustomConfig customConfig,
            GeneratorPublishConfig publishOutputMode) {
        SpringGeneratorContext context = new SpringGeneratorContext(
                ir,
                generatorConfig,
                customConfig,
                new FeatureResolver(ir, generatorConfig, generatorExecClient).getResolvedAuthSchemes());
        generateClient(context, ir);
    }

    public void generateClient(SpringGeneratorContext context, IntermediateRepresentation ir) {

        SpringCustomConfig springCustomConfig = getCustomConfig(context.getGeneratorConfig());

        // core
        ObjectMappersGenerator objectMappersGenerator = new ObjectMappersGenerator(context);
        GeneratedObjectMapper objectMapper = objectMappersGenerator.generateFile();
        this.addGeneratedFile(objectMapper);

        OptionalNullableGenerator optionalNullableGenerator = new OptionalNullableGenerator(context);
        GeneratedJavaFile optionalNullable = optionalNullableGenerator.generateFile();
        this.addGeneratedFile(optionalNullable);

        ApiExceptionGenerator apiExceptionGenerator = new ApiExceptionGenerator(context);
        GeneratedJavaFile apiException = apiExceptionGenerator.generateFile();
        this.addGeneratedFile(apiException);

        DateTimeDeserializerGenerator dateTimeDeserializerGenerator = new DateTimeDeserializerGenerator(context);
        this.addGeneratedFile(dateTimeDeserializerGenerator.generateFile());

        Optional<GeneratedJavaFile> errorBodyFile = getErrorBody(context);
        errorBodyFile.ifPresent(this::addGeneratedFile);

        // auth
        AuthGenerator authGenerator = new AuthGenerator(context);
        Optional<GeneratedAuthFiles> maybeAuth = authGenerator.generate();
        maybeAuth.ifPresent(this::addGeneratedFile);

        // types
        TypesGenerator typesGenerator = new TypesGenerator(context);
        Result generatedTypes = typesGenerator.generateFiles();
        generatedTypes.getTypes().values().forEach(this::addGeneratedFile);
        generatedTypes.getInterfaces().values().forEach(this::addGeneratedFile);

        // errors
        Map<ErrorId, GeneratedSpringException> generatedErrors = KeyedStream.stream(
                        context.getIr().getErrors())
                .map(errorDeclaration -> {
                    ExceptionGenerator exceptionGenerator =
                            new ExceptionGenerator(context, apiException, errorBodyFile, errorDeclaration);
                    GeneratedSpringException springException = exceptionGenerator.generateFile();
                    this.addGeneratedFile(springException);
                    this.addGeneratedFile(springException.controllerAdvice());
                    return springException;
                })
                .collectToMap();

        // services
        List<GeneratedSpringServerInterface> generatedSpringServerInterfaces = ir.getServices().values().stream()
                .map(httpService -> {
                    SpringServerInterfaceGenerator httpServiceClientGenerator = new SpringServerInterfaceGenerator(
                            context, maybeAuth, generatedTypes.getInterfaces(), generatedErrors, httpService);
                    return httpServiceClientGenerator.generateFile();
                })
                .collect(Collectors.toList());
        generatedSpringServerInterfaces.forEach(generatedSpringServerInterface -> {
            addGeneratedFile(generatedSpringServerInterface);
            generatedSpringServerInterface.generatedRequestBodyFiles().forEach(this::addGeneratedFile);
        });
    }

    @Override
    public List<AbstractGradleDependency> getBuildGradleDependencies() {
        return List.of(
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("org.springframework.boot")
                        .artifact("spring-boot-starter-jersey")
                        .version("3.4.5")
                        .build(),
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("org.glassfish.jersey.ext")
                        .artifact("jersey-spring6")
                        .version("3.1.9")
                        .build(),
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("jakarta.annotation")
                        .artifact("jakarta.annotation-api")
                        .version("2.1.1")
                        .build(),
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("jakarta.validation")
                        .artifact("jakarta.validation-api")
                        .version("3.0.2")
                        .build(),
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("jakarta.ws.rs")
                        .artifact("jakarta.ws.rs-api")
                        .version("3.1.0")
                        .build(),
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("com.fasterxml.jackson.core")
                        .artifact("jackson-databind")
                        .version(ParsedGradleDependency.JACKSON_DATABIND_VERSION)
                        .build(),
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("com.fasterxml.jackson.datatype")
                        .artifact("jackson-datatype-jdk8")
                        .version(ParsedGradleDependency.JACKSON_JDK8_VERSION)
                        .build(),
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("com.fasterxml.jackson.datatype")
                        .artifact("jackson-datatype-jsr310")
                        .version(ParsedGradleDependency.JACKSON_JDK8_VERSION)
                        .build());
    }

    @Override
    public List<String> getSubProjects() {
        return subprojects;
    }

    @Override
    public List<String> getAdditionalBuildGradleBlocks() {
        return List.of("java {\n"
                + "    toolchain {\n"
                + "        languageVersion = JavaLanguageVersion.of(17)\n"
                + "    }\n"
                + "    sourceCompatibility = JavaVersion.VERSION_17\n"
                + "    targetCompatibility = JavaVersion.VERSION_17\n"
                + "}");
    }

    @Override
    public SpringCustomConfig getDownloadFilesCustomConfig(GeneratorConfig generatorConfig) {
        if (generatorConfig.getCustomConfig().isPresent()) {
            JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(
                    generatorConfig.getCustomConfig().get());
            return ObjectMappers.JSON_MAPPER.convertValue(node, SpringCustomConfig.class);
        }
        return SpringCustomConfig.builder().build();
    }

    @Override
    public SpringCustomConfig getCustomConfig(GeneratorConfig generatorConfig) {
        if (generatorConfig.getCustomConfig().isPresent()) {
            JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(
                    generatorConfig.getCustomConfig().get());
            return ObjectMappers.JSON_MAPPER.convertValue(node, SpringCustomConfig.class);
        }
        return SpringCustomConfig.builder().build();
    }

    private Optional<GeneratedJavaFile> getErrorBody(SpringGeneratorContext context) {
        if (context.getIr().getErrorDiscriminationStrategy().isProperty()) {
            ErrorDiscriminationByPropertyStrategy errorDiscriminationByPropertyStrategy = context.getIr()
                    .getErrorDiscriminationStrategy()
                    .getProperty()
                    .get();
            ErrorBodyGenerator errorBodyGenerator =
                    new ErrorBodyGenerator(errorDiscriminationByPropertyStrategy, context);
            return Optional.of(errorBodyGenerator.generateFile());
        }
        return Optional.empty();
    }

    public static void main(String... args) {
        Cli cli = new Cli();
        cli.run(args);
    }
}
