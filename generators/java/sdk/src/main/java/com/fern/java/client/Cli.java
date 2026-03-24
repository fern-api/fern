package com.fern.java.client;

import static com.fern.java.GeneratorLogging.log;

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.ir.core.ObjectMappers;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.InferredAuthScheme;
import com.fern.ir.model.auth.OAuthScheme;
import com.fern.ir.model.commons.EndpointReference;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.ir.HeaderApiVersionScheme;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.publish.DirectPublish;
import com.fern.ir.model.publish.Filesystem;
import com.fern.ir.model.publish.GithubPublish;
import com.fern.ir.model.publish.PublishingConfig.Visitor;
import com.fern.ir.model.websocket.WebSocketChannel;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.AbstractPoetClassNameFactory;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.FeatureResolver;
import com.fern.java.JavaV2Adapter;
import com.fern.java.JavaV2Arguments;
import com.fern.java.client.generators.AbstractRootClientGenerator;
import com.fern.java.client.generators.AbstractSubpackageClientGenerator;
import com.fern.java.client.generators.ApiErrorGenerator;
import com.fern.java.client.generators.AsyncRootClientGenerator;
import com.fern.java.client.generators.AsyncSubpackageClientGenerator;
import com.fern.java.client.generators.BaseErrorGenerator;
import com.fern.java.client.generators.ClientOptionsGenerator;
import com.fern.java.client.generators.ConsoleLoggerGenerator;
import com.fern.java.client.generators.CoreMediaTypesGenerator;
import com.fern.java.client.generators.EnvironmentGenerator;
import com.fern.java.client.generators.ErrorGenerator;
import com.fern.java.client.generators.FileStreamGenerator;
import com.fern.java.client.generators.HttpResponseGenerator;
import com.fern.java.client.generators.ILoggerGenerator;
import com.fern.java.client.generators.InferredAuthTokenSupplierGenerator;
import com.fern.java.client.generators.InputStreamRequestBodyGenerator;
import com.fern.java.client.generators.LogConfigGenerator;
import com.fern.java.client.generators.LogLevelGenerator;
import com.fern.java.client.generators.LoggerGenerator;
import com.fern.java.client.generators.LoggingInterceptorGenerator;
import com.fern.java.client.generators.OAuthTokenSupplierGenerator;
import com.fern.java.client.generators.RequestOptionsGenerator;
import com.fern.java.client.generators.ResponseBodyInputStreamGenerator;
import com.fern.java.client.generators.ResponseBodyReaderGenerator;
import com.fern.java.client.generators.RetryInterceptorGenerator;
import com.fern.java.client.generators.SampleAppGenerator;
import com.fern.java.client.generators.StreamTestGenerator;
import com.fern.java.client.generators.SuppliersGenerator;
import com.fern.java.client.generators.SyncRootClientGenerator;
import com.fern.java.client.generators.SyncSubpackageClientGenerator;
import com.fern.java.client.generators.TestGenerator;
import com.fern.java.client.generators.auth.AuthProviderGenerator;
import com.fern.java.client.generators.auth.BasicAuthProviderGenerator;
import com.fern.java.client.generators.auth.BearerAuthProviderGenerator;
import com.fern.java.client.generators.auth.EndpointMetadataGenerator;
import com.fern.java.client.generators.auth.HeaderAuthProviderGenerator;
import com.fern.java.client.generators.auth.InferredAuthProviderGenerator;
import com.fern.java.client.generators.auth.OAuthAuthProviderGenerator;
import com.fern.java.client.generators.auth.RoutingAuthProviderGenerator;
import com.fern.java.client.generators.websocket.AsyncWebSocketChannelWriter;
import com.fern.java.client.generators.websocket.SyncWebSocketChannelWriter;
import com.fern.java.generators.DateTimeDeserializerGenerator;
import com.fern.java.generators.DoubleSerializerGenerator;
import com.fern.java.generators.EnumGenerator;
import com.fern.java.generators.NullableGenerator;
import com.fern.java.generators.NullableNonemptyFilterGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.generators.OptionalNullableGenerator;
import com.fern.java.generators.PaginationCoreGenerator;
import com.fern.java.generators.QueryStringMapperGenerator;
import com.fern.java.generators.Rfc2822DateTimeDeserializerGenerator;
import com.fern.java.generators.SseEventGenerator;
import com.fern.java.generators.SseEventParserGenerator;
import com.fern.java.generators.StreamGenerator;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.generators.WrappedAliasGenerator;
import com.fern.java.generators.tests.QueryStringMapperTestGenerator;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.output.GeneratedResourcesJavaFile;
import com.fern.java.output.gradle.AbstractGradleDependency;
import com.fern.java.output.gradle.GradleDependency;
import com.fern.java.output.gradle.GradleDependencyType;
import com.fern.java.output.gradle.GradlePlugin;
import com.fern.java.output.gradle.ParsedGradleDependency;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import javax.lang.model.element.Modifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class Cli extends AbstractGeneratorCli<JavaSdkCustomConfig, JavaSdkDownloadFilesCustomConfig> {

    private static final Logger log = LoggerFactory.getLogger(Cli.class);

    public static void main(String... args) {
        Cli cli = new Cli();
        cli.run(args);
    }

    private final List<String> subprojects = new ArrayList<>();

    private final List<AbstractGradleDependency> dependencies = new ArrayList<>();

    private final List<GradlePlugin> customPlugins = new ArrayList<>();

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
    public void runV2Generator(DefaultGeneratorExecClient defaultGeneratorExecClient, String[] args) {
        JavaV2Adapter.run(defaultGeneratorExecClient, new JavaV2Arguments(args[0]));
    }

    @Override
    public boolean customConfigPublishToCentral(GeneratorConfig generatorConfig) {
        return getCustomConfig(generatorConfig)
                .publishTo()
                .map(publishTo -> publishTo.equals("central"))
                .orElse(false);
    }

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            JavaSdkDownloadFilesCustomConfig customConfig) {
        JavaSdkCustomConfig sdkCustomConfig = JavaSdkCustomConfig.builder()
                .wrappedAliases(customConfig.wrappedAliases())
                .clientClassName(customConfig.clientClassName())
                .baseApiExceptionClassName(customConfig.baseApiExceptionClassName())
                .baseExceptionClassName(customConfig.baseExceptionClassName())
                .customDependencies(customConfig.customDependencies())
                .useDefaultRequestParameterValues(customConfig.useDefaultRequestParameterValues())
                .enableWireTests(customConfig.enableWireTests())
                .useNullableAnnotation(customConfig.useNullableAnnotation())
                .collapseOptionalNullable(customConfig.collapseOptionalNullable())
                .gradleCentralDependencyManagement(customConfig.gradleCentralDependencyManagement())
                .customInterceptors(customConfig.customInterceptors())
                .customPlugins(customConfig.customPlugins())
                .enableForwardCompatibleEnum(customConfig.enableForwardCompatibleEnums())
                .build();

        Boolean generateFullProject = ir.getPublishConfig()
                .map(publishConfig -> publishConfig.visit(new Visitor<Boolean>() {
                    @Override
                    public Boolean visitDirect(DirectPublish value) {
                        return false;
                    }

                    @Override
                    public Boolean visitGithub(GithubPublish value) {
                        return false;
                    }

                    @Override
                    public Boolean visitFilesystem(Filesystem value) {
                        return value.getGenerateFullProject();
                    }

                    @Override
                    public Boolean _visitUnknown(Object value) {
                        throw new RuntimeException("Encountered unknown publish config: " + value);
                    }
                }))
                .orElse(false);

        if (generateFullProject) {
            this.runInProjectModeHook(generatorExecClient, generatorConfig, ir, sdkCustomConfig);
            return;
        }

        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(
                customConfig.packagePrefix().map(List::of).orElseGet(Collections::emptyList),
                customConfig.packageLayout(),
                sdkCustomConfig.customPagerName());
        ClientGeneratorContext context = new ClientGeneratorContext(
                ir,
                generatorConfig,
                sdkCustomConfig,
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
        this.runInProjectModeHook(generatorExecClient, generatorConfig, ir, customConfig);
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
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(
                packagePrefixTokens, customConfig.packageLayout(), customConfig.customPagerName());
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

        log(generatorExecClient, "Generating core SDK files");

        // core
        ObjectMappersGenerator objectMappersGenerator = new ObjectMappersGenerator(context);
        GeneratedObjectMapper objectMapper = objectMappersGenerator.generateFile();
        this.addGeneratedFile(objectMapper);

        NullableGenerator nullableGenerator = new NullableGenerator(context);
        this.addGeneratedFile(nullableGenerator.generateFile());
        if (context.getCustomConfig().collapseOptionalNullable()) {
            OptionalNullableGenerator optionalNullableGenerator = new OptionalNullableGenerator(context);
            this.addGeneratedFile(optionalNullableGenerator.generateFile());
        }

        NullableNonemptyFilterGenerator nullableNonemptyFilterGenerator = new NullableNonemptyFilterGenerator(context);
        this.addGeneratedFile(nullableNonemptyFilterGenerator.generateFile());

        boolean hasUnknownAliasTypes = ir.getTypes().values().stream()
                .anyMatch(typeDeclaration -> typeDeclaration.getShape().isAlias()
                        && typeDeclaration
                                .getShape()
                                .getAlias()
                                .get()
                                .getAliasOf()
                                .isUnknown());
        if (context.getCustomConfig().wrappedAliases() || hasUnknownAliasTypes) {
            WrappedAliasGenerator wrappedAliasGenerator = new WrappedAliasGenerator(context);
            this.addGeneratedFile(wrappedAliasGenerator.generateFile());
        }

        EnvironmentGenerator environmentGenerator = new EnvironmentGenerator(context);
        GeneratedEnvironmentsClass generatedEnvironmentsClass = environmentGenerator.generateFile();
        this.addGeneratedFile(generatedEnvironmentsClass);

        ir.getApiVersion()
                .flatMap(apiVersion -> apiVersion.getHeader().map(HeaderApiVersionScheme::getValue))
                .ifPresent(irDeclaration -> {
                    EnumGenerator apiVersionsGenerator = new EnumGenerator(
                            context.getPoetClassNameFactory().getApiVersionClassName(),
                            context,
                            irDeclaration,
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

        String apiExceptionSimpleName = context.getPoetClassNameFactory()
                .getApiErrorClassName(
                        context.getGeneratorConfig().getOrganization(),
                        context.getGeneratorConfig().getWorkspaceName(),
                        context.getCustomConfig())
                .simpleName();
        String baseExceptionSimpleName = context.getPoetClassNameFactory()
                .getBaseExceptionClassName(
                        context.getGeneratorConfig().getOrganization(),
                        context.getGeneratorConfig().getWorkspaceName(),
                        context.getCustomConfig())
                .simpleName();
        PaginationCoreGenerator paginationCoreGenerator = new PaginationCoreGenerator(
                context, generatorExecClient, apiExceptionSimpleName, baseExceptionSimpleName);
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

        LogLevelGenerator logLevelGenerator = new LogLevelGenerator(context);
        this.addGeneratedFile(logLevelGenerator.generateFile());

        ILoggerGenerator iLoggerGenerator = new ILoggerGenerator(context);
        this.addGeneratedFile(iLoggerGenerator.generateFile());

        ConsoleLoggerGenerator consoleLoggerGenerator = new ConsoleLoggerGenerator(context);
        this.addGeneratedFile(consoleLoggerGenerator.generateFile());

        LogConfigGenerator logConfigGenerator = new LogConfigGenerator(context);
        this.addGeneratedFile(logConfigGenerator.generateFile());

        LoggerGenerator loggerGenerator = new LoggerGenerator(context);
        this.addGeneratedFile(loggerGenerator.generateFile());

        LoggingInterceptorGenerator loggingInterceptorGenerator = new LoggingInterceptorGenerator(context);
        this.addGeneratedFile(loggingInterceptorGenerator.generateFile());

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

        // Generate WebSocket factory classes if WebSocket channels exist
        if (ir.getWebsocketChannels().isPresent()
                && !ir.getWebsocketChannels().get().isEmpty()) {
            // Generate WebSocketFactory interface
            String corePackageName = context.getPoetClassNameFactory()
                    .getCoreClassName("WebSocketFactory")
                    .packageName();
            com.fern.java.client.generators.websocket.WebSocketFactoryGenerator webSocketFactoryGenerator =
                    new com.fern.java.client.generators.websocket.WebSocketFactoryGenerator(corePackageName);
            this.addGeneratedFile(webSocketFactoryGenerator.generateInterface());

            // Generate OkHttpWebSocketFactory implementation
            com.fern.java.client.generators.websocket.OkHttpWebSocketFactoryGenerator okHttpWebSocketFactoryGenerator =
                    new com.fern.java.client.generators.websocket.OkHttpWebSocketFactoryGenerator(corePackageName);
            this.addGeneratedFile(okHttpWebSocketFactoryGenerator.generateImplementation());

            // Generate ReconnectingWebSocketListener
            com.fern.java.client.generators.websocket.ReconnectingWebSocketListenerGenerator
                    reconnectingListenerGenerator =
                            new com.fern.java.client.generators.websocket.ReconnectingWebSocketListenerGenerator(
                                    corePackageName);
            this.addGeneratedFile(reconnectingListenerGenerator.generateListener());

            // Generate shared WebSocket types in core package
            com.fern.java.client.generators.websocket.DisconnectReasonGenerator disconnectReasonGenerator =
                    new com.fern.java.client.generators.websocket.DisconnectReasonGenerator(corePackageName);
            this.addGeneratedFile(disconnectReasonGenerator.generateFile());

            com.fern.java.client.generators.websocket.WebSocketReadyStateGenerator webSocketReadyStateGenerator =
                    new com.fern.java.client.generators.websocket.WebSocketReadyStateGenerator(corePackageName);
            this.addGeneratedFile(webSocketReadyStateGenerator.generateFile());
        }

        DateTimeDeserializerGenerator dateTimeDeserializerGenerator = new DateTimeDeserializerGenerator(context);
        this.addGeneratedFile(dateTimeDeserializerGenerator.generateFile());

        Rfc2822DateTimeDeserializerGenerator rfc2822DateTimeDeserializerGenerator =
                new Rfc2822DateTimeDeserializerGenerator(context);
        this.addGeneratedFile(rfc2822DateTimeDeserializerGenerator.generateFile());

        DoubleSerializerGenerator doubleSerializerGenerator = new DoubleSerializerGenerator(context);
        this.addGeneratedFile(doubleSerializerGenerator.generateFile());

        StreamGenerator streamGenerator = new StreamGenerator(context);
        this.addGeneratedFile(streamGenerator.generateFile());

        SseEventGenerator sseEventGenerator = new SseEventGenerator(context);
        this.addGeneratedFile(sseEventGenerator.generateFile());

        SseEventParserGenerator sseEventParserGenerator = new SseEventParserGenerator(context);
        this.addGeneratedFile(sseEventParserGenerator.generateFile());

        QueryStringMapperGenerator queryStringMapperGenerator = new QueryStringMapperGenerator(context);
        this.addGeneratedFile(queryStringMapperGenerator.generateFile());
        QueryStringMapperTestGenerator queryStringMapperTestGenerator = new QueryStringMapperTestGenerator(context);
        this.addGeneratedFile(queryStringMapperTestGenerator.generateFile());

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
        dependencies.add(ParsedGradleDependency.builder()
                .type(GradleDependencyType.TEST_IMPLEMENTATION)
                .group("org.junit.jupiter")
                .artifact("junit-jupiter-params")
                .version(ParsedGradleDependency.JUNIT_DEPENDENCY)
                .build());

        SuppliersGenerator suppliersGenerator = new SuppliersGenerator(context);
        GeneratedJavaFile generatedSuppliersFile = suppliersGenerator.generateFile();
        this.addGeneratedFile(generatedSuppliersFile);

        if (context.isEndpointSecurity()) {
            log(generatorExecClient, "Generating auth provider infrastructure for endpoint security");

            AuthProviderGenerator authProviderGenerator = new AuthProviderGenerator(context);
            this.addGeneratedFile(authProviderGenerator.generateFile());

            EndpointMetadataGenerator endpointMetadataGenerator = new EndpointMetadataGenerator(context);
            this.addGeneratedFile(endpointMetadataGenerator.generateFile());

            RoutingAuthProviderGenerator routingAuthProviderGenerator = new RoutingAuthProviderGenerator(context);
            this.addGeneratedFile(routingAuthProviderGenerator.generateFile());

            for (AuthScheme authScheme : context.getResolvedAuthSchemes()) {
                authScheme.getBearer().ifPresent(bearerScheme -> {
                    BearerAuthProviderGenerator bearerGenerator =
                            new BearerAuthProviderGenerator(context, bearerScheme);
                    this.addGeneratedFile(bearerGenerator.generateFile());
                });

                authScheme.getBasic().ifPresent(basicScheme -> {
                    BasicAuthProviderGenerator basicGenerator = new BasicAuthProviderGenerator(context, basicScheme);
                    this.addGeneratedFile(basicGenerator.generateFile());
                });

                authScheme.getHeader().ifPresent(headerScheme -> {
                    String schemeName =
                            headerScheme.getName().getName().getPascalCase().getSafeName();
                    HeaderAuthProviderGenerator headerGenerator =
                            new HeaderAuthProviderGenerator(context, headerScheme, schemeName);
                    this.addGeneratedFile(headerGenerator.generateFile());
                });

                authScheme.getOauth().ifPresent(oauthScheme -> {
                    oauthScheme.getConfiguration().getClientCredentials().ifPresent(clientCredentials -> {
                        EndpointReference tokenEndpointRef =
                                clientCredentials.getTokenEndpoint().getEndpointReference();
                        Subpackage authSubpackage = context.getIr()
                                .getSubpackages()
                                .get(tokenEndpointRef.getSubpackageId().get());
                        ClassName authClientClassName =
                                context.getPoetClassNameFactory().getClientClassName(authSubpackage);
                        OAuthAuthProviderGenerator oauthGenerator =
                                new OAuthAuthProviderGenerator(context, clientCredentials, authClientClassName);
                        this.addGeneratedFile(oauthGenerator.generateFile());
                    });
                });

                authScheme.getInferred().ifPresent(inferredScheme -> {
                    String schemeName = inferredScheme.getKey().get();
                    ClassName inferredAuthTokenSupplierClassName =
                            context.getPoetClassNameFactory().getCoreClassName("InferredAuthTokenSupplier");
                    InferredAuthProviderGenerator inferredGenerator =
                            new InferredAuthProviderGenerator(context, schemeName, inferredAuthTokenSupplierClassName);
                    this.addGeneratedFile(inferredGenerator.generateFile());
                });
            }
        }

        HttpResponseGenerator httpResponseGenerator = new HttpResponseGenerator(context);
        this.addGeneratedFile(httpResponseGenerator.generateFile());

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
        log(generatorExecClient, "Generating data types and models");
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

        // Generate InferredAuthTokenSupplier if inferred auth is present
        Optional<InferredAuthScheme> maybeInferredAuthScheme = context.getResolvedAuthSchemes().stream()
                .map(AuthScheme::getInferred)
                .flatMap(Optional::stream)
                .findFirst();
        Optional<GeneratedJavaFile> generatedInferredAuthTokenSupplier =
                maybeInferredAuthScheme.map(it -> new InferredAuthTokenSupplierGenerator(context, it).generateFile());

        generatedInferredAuthTokenSupplier.ifPresent(this::addGeneratedFile);

        // subpackage clients and their WebSocket channels
        log(generatorExecClient, "Generating API client classes");
        ir.getSubpackages().values().forEach(subpackage -> {
            // Generate subpackage clients if there are endpoints or WebSocket channels
            if (subpackage.getHasEndpointsInTree() || subpackage.getWebsocket().isPresent()) {
                AbstractSubpackageClientGenerator syncServiceClientGenerator = new SyncSubpackageClientGenerator(
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
                GeneratedClient syncGeneratedClient = syncServiceClientGenerator.generateFile();
                this.addGeneratedFile(syncGeneratedClient);
                syncGeneratedClient.rawClient().ifPresent(this::addGeneratedFile);
                syncGeneratedClient.wrappedRequests().forEach(this::addGeneratedFile);

                AbstractSubpackageClientGenerator asyncServiceClientGenerator = new AsyncSubpackageClientGenerator(
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
                GeneratedClient asyncGeneratedClient = asyncServiceClientGenerator.generateFile();
                this.addGeneratedFile(asyncGeneratedClient);
                asyncGeneratedClient.rawClient().ifPresent(this::addGeneratedFile);
                asyncGeneratedClient.wrappedRequests().forEach(this::addGeneratedFile);
            }

            // Generate WebSocket channel if present in this subpackage
            if (subpackage.getWebsocket().isPresent()
                    && ir.getWebsocketChannels().isPresent()) {
                WebSocketChannel websocketChannel = ir.getWebsocketChannels()
                        .get()
                        .get(subpackage.getWebsocket().get());
                if (websocketChannel != null) {
                    generateWebSocketChannelClients(
                            websocketChannel,
                            Optional.of(subpackage),
                            context,
                            generatedClientOptions,
                            generatedEnvironmentsClass,
                            objectMapper);
                }
            }
        });

        // Root-level WebSocket channel clients (those not in a subpackage)
        if (ir.getRootPackage().getWebsocket().isPresent()
                && ir.getWebsocketChannels().isPresent()) {
            WebSocketChannel websocketChannel = ir.getWebsocketChannels()
                    .get()
                    .get(ir.getRootPackage().getWebsocket().get());
            if (websocketChannel != null) {
                generateWebSocketChannelClients(
                        websocketChannel,
                        Optional.empty(),
                        context,
                        generatedClientOptions,
                        generatedEnvironmentsClass,
                        objectMapper);
            }
        }

        // root clients
        AbstractRootClientGenerator syncRootClientGenerator = new SyncRootClientGenerator(
                context,
                objectMapper,
                context,
                generatedClientOptions,
                generatedSuppliersFile,
                generatedEnvironmentsClass,
                generatedRequestOptions,
                generatedTypes.getInterfaces(),
                generatedOAuthTokenSupplier,
                generatedInferredAuthTokenSupplier,
                generatedErrors);
        GeneratedRootClient generatedSyncRootClient = syncRootClientGenerator.generateFile();
        this.addGeneratedFile(generatedSyncRootClient);
        this.addGeneratedFile(generatedSyncRootClient.builderClass());
        generatedSyncRootClient.rawClient().ifPresent(this::addGeneratedFile);
        generatedSyncRootClient.wrappedRequests().forEach(this::addGeneratedFile);

        AbstractRootClientGenerator asyncRootClientGenerator = new AsyncRootClientGenerator(
                context,
                objectMapper,
                context,
                generatedClientOptions,
                generatedSuppliersFile,
                generatedEnvironmentsClass,
                generatedRequestOptions,
                generatedTypes.getInterfaces(),
                generatedOAuthTokenSupplier,
                generatedInferredAuthTokenSupplier,
                generatedErrors);
        GeneratedRootClient generatedAsyncRootClient = asyncRootClientGenerator.generateFile();
        this.addGeneratedFile(generatedAsyncRootClient);
        this.addGeneratedFile(generatedAsyncRootClient.builderClass());
        generatedAsyncRootClient.rawClient().ifPresent(this::addGeneratedFile);
        generatedAsyncRootClient.wrappedRequests().forEach(this::addGeneratedFile);

        context.getCustomConfig().customDependencies().ifPresent(deps -> {
            for (String dep : deps) {
                dependencies.add(GradleDependency.of(dep));
            }
        });

        context.getCustomConfig().customPlugins().ifPresent(plugins -> {
            for (String plugin : plugins) {
                try {
                    customPlugins.add(GradlePlugin.of(plugin));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Failed to parse custom-plugins configuration: " + e.getMessage(), e);
                }
            }
        });
        return generatedAsyncRootClient;
    }

    private void generateWebSocketChannelClients(
            WebSocketChannel websocketChannel,
            Optional<Subpackage> subpackage,
            ClientGeneratorContext context,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedObjectMapper objectMapper) {
        // Generate connect options class if channel has query params
        Optional<ClassName> connectOptionsClassName = Optional.empty();
        if (!websocketChannel.getQueryParameters().isEmpty()) {
            ClassName wsClientClassName =
                    context.getPoetClassNameFactory().getWebSocketClientClassName(websocketChannel, subpackage);
            ClassName optionsClassName = ClassName.get(
                    wsClientClassName.packageName(),
                    websocketChannel.getName().get().getPascalCase().getSafeName() + "ConnectOptions");
            com.fern.java.client.generators.websocket.WebSocketConnectOptionsGenerator optionsGenerator =
                    new com.fern.java.client.generators.websocket.WebSocketConnectOptionsGenerator(
                            websocketChannel, context, optionsClassName);
            this.addGeneratedFile(optionsGenerator.generateFile());
            connectOptionsClassName = Optional.of(optionsClassName);
        }

        FieldSpec clientOptionsFieldSpec = FieldSpec.builder(generatedClientOptions.getClassName(), "clientOptions")
                .addModifiers(Modifier.PROTECTED, Modifier.FINAL)
                .build();

        // Generate sync WebSocket client
        SyncWebSocketChannelWriter syncWebSocketWriter = new SyncWebSocketChannelWriter(
                websocketChannel,
                context,
                generatedClientOptions,
                generatedEnvironmentsClass,
                objectMapper,
                clientOptionsFieldSpec,
                subpackage,
                connectOptionsClassName);
        this.addGeneratedFile(syncWebSocketWriter.generateFile());

        // Generate async WebSocket client
        AsyncWebSocketChannelWriter asyncWebSocketWriter = new AsyncWebSocketChannelWriter(
                websocketChannel,
                context,
                generatedClientOptions,
                generatedEnvironmentsClass,
                objectMapper,
                clientOptionsFieldSpec,
                subpackage,
                connectOptionsClassName);
        this.addGeneratedFile(asyncWebSocketWriter.generateFile());
    }

    @Override
    public List<AbstractGradleDependency> getBuildGradleDependencies() {
        return dependencies;
    }

    @Override
    public List<GradlePlugin> getCustomPlugins() {
        return customPlugins;
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

    private void runInProjectModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            JavaSdkCustomConfig customConfig) {
        List<String> packagePrefixTokens = customConfig
                .packagePrefix()
                .map(List::of)
                .orElseGet(() -> AbstractPoetClassNameFactory.getPackagePrefixWithOrgAndApiName(
                        ir, generatorConfig.getOrganization()));
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(
                packagePrefixTokens, customConfig.packageLayout(), customConfig.customPagerName());
        List<AuthScheme> resolvedAuthSchemes =
                new FeatureResolver(ir, generatorConfig, generatorExecClient).getResolvedAuthSchemes();
        ClientGeneratorContext context = new ClientGeneratorContext(
                ir, generatorConfig, customConfig, clientPoetClassNameFactory, resolvedAuthSchemes);
        GeneratedRootClient generatedClientWrapper = generateClient(context, ir, generatorExecClient);
        SampleAppGenerator sampleAppGenerator = new SampleAppGenerator(context, generatedClientWrapper);
        sampleAppGenerator.generateFiles().forEach(this::addGeneratedFile);
        subprojects.add(SampleAppGenerator.SAMPLE_APP_DIRECTORY);
        TestGenerator testGenerator = new TestGenerator(context);
        this.addGeneratedFile(testGenerator.generateFile());
        StreamTestGenerator streamTestGenerator = new StreamTestGenerator(context);
        this.addGeneratedFile(streamTestGenerator.generateFile());

        // Generate wire tests if enabled
        if (customConfig.enableWireTests()) {
            // Add MockWebServer dependency
            dependencies.add(ParsedGradleDependency.builder()
                    .type(GradleDependencyType.TEST_IMPLEMENTATION)
                    .group("com.squareup.okhttp3")
                    .artifact("mockwebserver")
                    .version(ParsedGradleDependency.OKHTTP_VERSION)
                    .build());
            // Wire tests are generated by the java-v2 TypeScript generator
        }
    }
}
