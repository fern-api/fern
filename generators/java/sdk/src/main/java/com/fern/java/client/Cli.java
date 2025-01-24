package com.fern.java.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.ir.core.ObjectMappers;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.OAuthScheme;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.ir.HeaderApiVersionScheme;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.types.EnumTypeDeclaration;
import com.fern.ir.model.types.EnumValue;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.AbstractPoetClassNameFactory;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.FeatureResolver;
import com.fern.java.client.generators.ApiErrorGenerator;
import com.fern.java.client.generators.BaseErrorGenerator;
import com.fern.java.client.generators.ClientOptionsGenerator;
import com.fern.java.client.generators.CoreMediaTypesGenerator;
import com.fern.java.client.generators.EnvironmentGenerator;
import com.fern.java.client.generators.ErrorGenerator;
import com.fern.java.client.generators.FileStreamGenerator;
import com.fern.java.client.generators.InputStreamRequestBodyGenerator;
import com.fern.java.client.generators.OAuthTokenSupplierGenerator;
import com.fern.java.client.generators.RequestOptionsGenerator;
import com.fern.java.client.generators.ResponseBodyInputStreamGenerator;
import com.fern.java.client.generators.ResponseBodyReaderGenerator;
import com.fern.java.client.generators.RetryInterceptorGenerator;
import com.fern.java.client.generators.RootClientGenerator;
import com.fern.java.client.generators.SampleAppGenerator;
import com.fern.java.client.generators.SubpackageClientGenerator;
import com.fern.java.client.generators.SuppliersGenerator;
import com.fern.java.client.generators.TestGenerator;
import com.fern.java.generators.DateTimeDeserializerGenerator;
import com.fern.java.generators.EnumGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.generators.PaginationCoreGenerator;
import com.fern.java.generators.StreamGenerator;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.output.GeneratedResourcesJavaFile;
import com.fern.java.output.gradle.AbstractGradleDependency;
import com.fern.java.output.gradle.GradleDependency;
import com.fern.java.output.gradle.GradleDependencyType;
import com.fern.java.output.gradle.ParsedGradleDependency;
import com.palantir.common.streams.KeyedStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class Cli extends AbstractGeneratorCli<JavaSdkCustomConfig, JavaSdkDownloadFilesCustomConfig> {

    private static final Logger log = LoggerFactory.getLogger(Cli.class);

    private final List<String> subprojects = new ArrayList<>();
    private final List<AbstractGradleDependency> dependencies = new ArrayList<>();

    public Cli() {
        this.dependencies.addAll(List.of(
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.API)
                        .group("com.squareup.okhttp3")
                        .artifact("okhttp")
                        .version(ParsedGradleDependency.OKHTTP_VERSION)
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
                        .build()));
    }

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            JavaSdkDownloadFilesCustomConfig customConfig) {
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(
                customConfig.packagePrefix().map(List::of).orElseGet(Collections::emptyList));
        ClientGeneratorContext context = new ClientGeneratorContext(
                ir,
                generatorConfig,
                JavaSdkCustomConfig.builder()
                        .wrappedAliases(customConfig.wrappedAliases())
                        .clientClassName(customConfig.clientClassName())
                        .baseApiExceptionClassName(customConfig.baseApiExceptionClassName())
                        .baseExceptionClassName(customConfig.baseExceptionClassName())
                        .customDependencies(customConfig.customDependencies())
                        .build(),
                clientPoetClassNameFactory,
                new FeatureResolver(ir, generatorConfig, generatorExecClient).getResolvedAuthSchemes());
        generateClient(context, ir, generatorExecClient);
    }

    @Override
    public void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            JavaSdkCustomConfig customConfig,
            GithubOutputMode githubOutputMode) {
        List<String> packagePrefixTokens = customConfig
                .packagePrefix()
                .map(List::of)
                .orElseGet(() -> AbstractPoetClassNameFactory.getPackagePrefixWithOrgAndApiName(
                        ir, generatorConfig.getOrganization()));
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(packagePrefixTokens);
        List<AuthScheme> resolvedAuthSchemes =
                new FeatureResolver(ir, generatorConfig, generatorExecClient).getResolvedAuthSchemes();
        ClientGeneratorContext context = new ClientGeneratorContext(
                ir, generatorConfig, customConfig, clientPoetClassNameFactory, resolvedAuthSchemes);
        GeneratedRootClient generatedClientWrapper = generateClient(context, ir, generatorExecClient);
        SampleAppGenerator sampleAppGenerator = new SampleAppGenerator(context, generatedClientWrapper);
        sampleAppGenerator.generateFiles().forEach(this::addGeneratedFile);
        subprojects.add(SampleAppGenerator.SAMPLE_APP_DIRECTORY);
        dependencies.add(ParsedGradleDependency.builder()
                .type(GradleDependencyType.TEST_IMPLEMENTATION)
                .group("org.junit.jupiter")
                .artifact("junit-jupiter-api")
                .version(ParsedGradleDependency.JUNIT_DEPENDENCY)
                .build());
        dependencies.add(ParsedGradleDependency.builder()
                .type(GradleDependencyType.TEST_IMPLEMENTATION)
                .group("org.junit.jupiter")
                .artifact("junit-jupiter-engine")
                .version(ParsedGradleDependency.JUNIT_DEPENDENCY)
                .build());
        TestGenerator testGenerator = new TestGenerator(context);
        this.addGeneratedFile(testGenerator.generateFile());
    }

    @Override
    public void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            JavaSdkCustomConfig customConfig,
            GeneratorPublishConfig publishOutputMode) {
        List<String> packagePrefixTokens = customConfig
                .packagePrefix()
                .map(List::of)
                .orElseGet(() -> AbstractPoetClassNameFactory.getPackagePrefixWithOrgAndApiName(
                        ir, generatorConfig.getOrganization()));
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(packagePrefixTokens);
        List<AuthScheme> resolvedAuthSchemes =
                new FeatureResolver(ir, generatorConfig, generatorExecClient).getResolvedAuthSchemes();
        ClientGeneratorContext context = new ClientGeneratorContext(
                ir, generatorConfig, customConfig, clientPoetClassNameFactory, resolvedAuthSchemes);
        generateClient(context, ir, generatorExecClient);
    }

    public GeneratedRootClient generateClient(
            ClientGeneratorContext context,
            IntermediateRepresentation ir,
            DefaultGeneratorExecClient generatorExecClient) {

        // core
        ObjectMappersGenerator objectMappersGenerator = new ObjectMappersGenerator(context);
        GeneratedObjectMapper objectMapper = objectMappersGenerator.generateFile();
        this.addGeneratedFile(objectMapper);

        EnvironmentGenerator environmentGenerator = new EnvironmentGenerator(context);
        GeneratedEnvironmentsClass generatedEnvironmentsClass = environmentGenerator.generateFile();
        this.addGeneratedFile(generatedEnvironmentsClass);

        ir.getApiVersion()
                .flatMap(apiVersion -> apiVersion.getHeader().map(HeaderApiVersionScheme::getValue))
                .ifPresent(irDeclaration -> {
                    EnumTypeDeclaration.Builder enumTypeDeclaration =
                            EnumTypeDeclaration.builder().from(irDeclaration);

                    irDeclaration.getDefault().ifPresent(defaultValue -> {
                        enumTypeDeclaration.addValues(EnumValue.builder()
                                .from(defaultValue)
                                .name(NameAndWireValue.builder()
                                        .from(defaultValue.getName())
                                        .name(ApiVersionConstants.CURRENT_API_VERSION_NAME)
                                        .build())
                                .build());
                    });

                    EnumGenerator apiVersionsGenerator = new EnumGenerator(
                            context.getPoetClassNameFactory().getApiVersionClassName(),
                            context,
                            enumTypeDeclaration.build(),
                            Set.of(context.getPoetClassNameFactory()
                                    .getApiVersionClassName()
                                    .simpleName()),
                            true);
                    GeneratedJavaFile generatedApiVersions = apiVersionsGenerator.generateFile();
                    this.addGeneratedFile(generatedApiVersions);
                });

        RequestOptionsGenerator requestOptionsGenerator = new RequestOptionsGenerator(
                context, context.getPoetClassNameFactory().getRequestOptionsClassName());
        GeneratedJavaFile generatedRequestOptions = requestOptionsGenerator.generateFile();
        this.addGeneratedFile(generatedRequestOptions);

        PaginationCoreGenerator paginationCoreGenerator = new PaginationCoreGenerator(context, generatorExecClient);
        List<GeneratedFile> generatedFiles = paginationCoreGenerator.generateFiles();
        generatedFiles.forEach(this::addGeneratedFile);

        if (!ir.getIdempotencyHeaders().isEmpty()) {
            RequestOptionsGenerator idempotentRequestOptionsGenerator = new RequestOptionsGenerator(
                    context,
                    context.getPoetClassNameFactory().getIdempotentRequestOptionsClassName(),
                    ir.getIdempotencyHeaders());
            GeneratedJavaFile generatedIdempotentRequestOptions = idempotentRequestOptionsGenerator.generateFile();
            this.addGeneratedFile(generatedIdempotentRequestOptions);
        }

        RetryInterceptorGenerator retryInterceptorGenerator = new RetryInterceptorGenerator(context);
        this.addGeneratedFile(retryInterceptorGenerator.generateFile());

        ResponseBodyInputStreamGenerator responseBodyInputStreamGenerator =
                new ResponseBodyInputStreamGenerator(context);
        this.addGeneratedFile(responseBodyInputStreamGenerator.generateFile());

        InputStreamRequestBodyGenerator inputStreamRequestBodyGenerator = new InputStreamRequestBodyGenerator(context);
        this.addGeneratedFile(inputStreamRequestBodyGenerator.generateFile());

        FileStreamGenerator fileStreamGenerator = new FileStreamGenerator(context);
        this.addGeneratedFile(fileStreamGenerator.generateFile());

        ResponseBodyReaderGenerator responseBodyReaderGenerator = new ResponseBodyReaderGenerator(context);
        this.addGeneratedFile(responseBodyReaderGenerator.generateFile());

        ClientOptionsGenerator clientOptionsGenerator =
                new ClientOptionsGenerator(context, generatedEnvironmentsClass, generatedRequestOptions);
        GeneratedClientOptions generatedClientOptions = clientOptionsGenerator.generateFile();
        this.addGeneratedFile(generatedClientOptions);

        DateTimeDeserializerGenerator dateTimeDeserializerGenerator = new DateTimeDeserializerGenerator(context);
        this.addGeneratedFile(dateTimeDeserializerGenerator.generateFile());

        StreamGenerator streamGenerator = new StreamGenerator(context);
        this.addGeneratedFile(streamGenerator.generateFile());

        SuppliersGenerator suppliersGenerator = new SuppliersGenerator(context);
        GeneratedJavaFile generatedSuppliersFile = suppliersGenerator.generateFile();
        this.addGeneratedFile(generatedSuppliersFile);

        BaseErrorGenerator baseErrorGenerator = new BaseErrorGenerator(context);
        GeneratedJavaFile generatedBaseErrorFile = baseErrorGenerator.generateFile();
        this.addGeneratedFile(generatedBaseErrorFile);

        ApiErrorGenerator apiErrorGenerator = new ApiErrorGenerator(context, generatedBaseErrorFile);
        GeneratedJavaFile generatedApiErrorFile = apiErrorGenerator.generateFile();
        this.addGeneratedFile(generatedApiErrorFile);

        CoreMediaTypesGenerator mediaTypesGenerator = new CoreMediaTypesGenerator(context);
        GeneratedResourcesJavaFile generatedMediaTypesFile = mediaTypesGenerator.generateFile();
        this.addGeneratedFile(generatedMediaTypesFile);

        // types
        TypesGenerator typesGenerator = new TypesGenerator(context);
        Result generatedTypes = typesGenerator.generateFiles();
        generatedTypes.getTypes().values().forEach(this::addGeneratedFile);
        generatedTypes.getInterfaces().values().forEach(this::addGeneratedFile);

        // errors
        Map<ErrorId, GeneratedJavaFile> generatedErrors = KeyedStream.stream(
                        context.getIr().getErrors())
                .map(errorDeclaration -> {
                    ErrorGenerator errorGenerator =
                            new ErrorGenerator(context, generatedApiErrorFile, errorDeclaration);
                    GeneratedJavaFile exception = errorGenerator.generateFile();
                    this.addGeneratedFile(exception);
                    return exception;
                })
                .collectToMap();

        Optional<OAuthScheme> maybeOAuthScheme = context.getResolvedAuthSchemes().stream()
                .map(AuthScheme::getOauth)
                .flatMap(Optional::stream)
                .findFirst();
        Optional<GeneratedJavaFile> generatedOAuthTokenSupplier =
                maybeOAuthScheme.map(it -> new OAuthTokenSupplierGenerator(
                                context,
                                it.getConfiguration()
                                        .getClientCredentials()
                                        .orElseThrow(() ->
                                                new RuntimeException("Only client credentials oAuth scheme supported")))
                        .generateFile());

        generatedOAuthTokenSupplier.ifPresent(this::addGeneratedFile);

        // subpackage clients
        ir.getSubpackages().values().forEach(subpackage -> {
            if (!subpackage.getHasEndpointsInTree()) {
                return;
            }
            SubpackageClientGenerator httpServiceClientGenerator = new SubpackageClientGenerator(
                    subpackage,
                    context,
                    objectMapper,
                    context,
                    generatedClientOptions,
                    generatedSuppliersFile,
                    generatedEnvironmentsClass,
                    generatedRequestOptions,
                    generatedTypes.getInterfaces(),
                    generatedErrors);
            GeneratedClient generatedClient = httpServiceClientGenerator.generateFile();
            this.addGeneratedFile(generatedClient);
            generatedClient.wrappedRequests().forEach(this::addGeneratedFile);
        });

        // root client
        RootClientGenerator rootClientGenerator = new RootClientGenerator(
                context,
                objectMapper,
                context,
                generatedClientOptions,
                generatedSuppliersFile,
                generatedEnvironmentsClass,
                generatedRequestOptions,
                generatedTypes.getInterfaces(),
                generatedOAuthTokenSupplier,
                generatedErrors);
        GeneratedRootClient generatedRootClient = rootClientGenerator.generateFile();
        this.addGeneratedFile(generatedRootClient);
        this.addGeneratedFile(generatedRootClient.builderClass());
        generatedRootClient.wrappedRequests().forEach(this::addGeneratedFile);

        context.getCustomConfig().customDependencies().ifPresent(deps -> {
            for (String dep : deps) {
                dependencies.add(GradleDependency.of(dep));
            }
        });
        return generatedRootClient;
    }

    @Override
    public List<AbstractGradleDependency> getBuildGradleDependencies() {
        return dependencies;
    }

    @Override
    public List<String> getSubProjects() {
        return subprojects;
    }

    @Override
    public JavaSdkDownloadFilesCustomConfig getDownloadFilesCustomConfig(GeneratorConfig generatorConfig) {
        if (generatorConfig.getCustomConfig().isPresent()) {
            JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(
                    generatorConfig.getCustomConfig().get());
            return ObjectMappers.JSON_MAPPER.convertValue(node, JavaSdkDownloadFilesCustomConfig.class);
        }
        return JavaSdkDownloadFilesCustomConfig.builder().build();
    }

    @Override
    public JavaSdkCustomConfig getCustomConfig(GeneratorConfig generatorConfig) {
        if (generatorConfig.getCustomConfig().isPresent()) {
            JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(
                    generatorConfig.getCustomConfig().get());
            return ObjectMappers.JSON_MAPPER.convertValue(node, JavaSdkCustomConfig.class);
        }
        return JavaSdkCustomConfig.builder().build();
    }

    public static void main(String... args) {
        Cli cli = new Cli();
        cli.run(args);
    }
}
