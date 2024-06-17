package com.fern.java.spring.generators.spring;

import com.fern.ir.model.auth.ApiAuth;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.BasicAuthScheme;
import com.fern.ir.model.auth.BearerAuthScheme;
import com.fern.ir.model.auth.HeaderAuthScheme;
import com.fern.ir.model.auth.OAuthScheme;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.fern.java.output.GeneratedAuthFiles;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.RequestHeader;

public final class AuthToSpringParameterSpecConverter {
    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final GeneratedAuthFiles generatedAuthFiles;

    public AuthToSpringParameterSpecConverter(
            AbstractGeneratorContext<?, ?> generatorContext, GeneratedAuthFiles generatedAuthFiles) {
        this.generatorContext = generatorContext;
        this.generatedAuthFiles = generatedAuthFiles;
    }

    public List<ParameterSpec> getAuthParameters(HttpEndpoint httpEndpoint) {
        ApiAuth apiAuth = generatorContext.getIr().getAuth();
        List<AuthScheme> schemes = generatorContext.getResolvedAuthSchemes();
        if (!httpEndpoint.getAuth() || schemes.isEmpty()) {
            return Collections.emptyList();
        } else if (schemes.size() == 1) {
            AuthScheme authScheme = schemes.get(0);
            ParameterSpec parameterSpec =
                    authScheme.visit(new AuthSchemeParameterSpec(generatedAuthFiles, "auth", false));
            return Collections.singletonList(parameterSpec);
        }
        return Collections.emptyList();
    }

    private static final class AuthSchemeParameterSpec implements AuthScheme.Visitor<ParameterSpec> {

        private final AbstractGeneratedJavaFile generatedFile;
        private final boolean isOptional;
        private final String parameterName;

        private AuthSchemeParameterSpec(
                AbstractGeneratedJavaFile generatedFile, String parameterName, boolean isOptional) {
            this.generatedFile = generatedFile;
            this.isOptional = isOptional;
            this.parameterName = parameterName;
        }

        @Override
        public ParameterSpec visitBearer(BearerAuthScheme value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(RequestHeader.class)
                            .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec visitBasic(BasicAuthScheme value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(RequestHeader.class)
                            .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec visitHeader(HeaderAuthScheme value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(RequestHeader.class)
                            .addMember("value", "$S", value.getName().getWireValue())
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec visitOauth(OAuthScheme oauth) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(RequestHeader.class)
                            .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown AuthScheme: " + unknownType);
        }

        private TypeName getTypeName() {
            if (isOptional) {
                return ParameterizedTypeName.get(ClassName.get(Optional.class), generatedFile.getClassName());
            } else {
                return generatedFile.getClassName();
            }
        }
    }
}
