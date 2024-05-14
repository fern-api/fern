package com.fern.java.generators.auth;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.irV42.model.auth.OAuthClientCredentials;
import com.fern.irV42.model.auth.OAuthConfiguration;
import com.fern.irV42.model.auth.OAuthConfiguration.Visitor;
import com.fern.irV42.model.auth.OAuthScheme;
import com.fern.irV42.model.commons.EndpointReference;
import com.fern.irV42.model.http.HttpEndpoint;
import com.fern.irV42.model.http.HttpService;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

public class OAuthGenerator extends AbstractFileGenerator {

    private static final String CLIENT_ID_FIELD_NAME = "clientId";
    private static final String CLIENT_SECRET_FIELD_NAME = "clientSecret";
    private static final String ACCESS_TOKEN_FIELD_NAME = "accessToken";

    private static final String FETCH_TOKEN_METHOD_NAME = "fetchToken";
    private static final String GET_METHOD_NAME = "get";

    private final OAuthScheme oauthSchema;

    public OAuthGenerator(AbstractGeneratorContext<?, ?> generatorContext, OAuthScheme oauthSchema) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("OAuth"), generatorContext);
        this.oauthSchema = oauthSchema;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        return oauthSchema.getConfiguration().visit(new OAuthConfigurationGenerator());
    }

    private class OAuthConfigurationGenerator implements Visitor<GeneratedJavaFile> {

        @Override
        public GeneratedJavaFile visitClientCredentials(OAuthClientCredentials clientCredentials) {
            EndpointReference tokenEndpointReference = clientCredentials.getTokenEndpoint().getEndpointReference();
            HttpService service = generatorContext.getIr().getServices()
                .get(tokenEndpointReference.getServiceId());
            HttpEndpoint endpoint = service.getEndpoints().stream()
                .filter(it -> it.getId() == tokenEndpointReference.getEndpointId())
                .findFirst().orElseThrow();
            endpoint.getRequestBody().get().getReference().get().getRequestBodyType();

            // todo: add import for get token request name
            String tokenRequestName = "tokenRequestName"; // todo: put real value here

            TypeSpec oAuthTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(String.class, CLIENT_ID_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                    .build())
                .addField(FieldSpec.builder(String.class, CLIENT_SECRET_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                    .build())
                .addField(FieldSpec.builder(String.class, ACCESS_TOKEN_FIELD_NAME, Modifier.PRIVATE)
                    .build())
                // todo: add auth client field
                .addMethod(MethodSpec.constructorBuilder()
                    .addModifiers(Modifier.PRIVATE)
                    .addParameter(String.class, CLIENT_ID_FIELD_NAME)
                    .addParameter(String.class, CLIENT_SECRET_FIELD_NAME)
                    // todo: add auth client parameter and statement
                    .addStatement("this.$L = $L", CLIENT_ID_FIELD_NAME, CLIENT_ID_FIELD_NAME)
                    .addStatement("this.$L = $L", CLIENT_SECRET_FIELD_NAME, CLIENT_SECRET_FIELD_NAME)
                    .build())
                .addMethod(MethodSpec.methodBuilder(FETCH_TOKEN_METHOD_NAME)
                    .addModifiers(Modifier.PUBLIC)
                    .returns(String.class)
                    .addAnnotation(JsonValue.class)
                    .addStatement("$L getTokenRequest = $L.builder().clientId()", tokenRequestName) // todo: finish method
                    .build())
                // todo: add get method
                .build();
            JavaFile authHeaderFile =
                JavaFile.builder(className.packageName(), oAuthTypeSpec).build();
            return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(authHeaderFile)
                .build();
        }

        @Override
        public GeneratedJavaFile _visitUnknown(Object unknownType) {
            throw new RuntimeException("Unexpected OAuthConfiguration type " + unknownType);
        }
    }
}
