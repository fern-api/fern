package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.FileProperty;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequest;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.generators.visitors.FilePropertyIsOptional;
import com.fern.java.client.generators.visitors.GetFilePropertyKey;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class WrappedRequestEndpointWriterVariableNameContext extends AbstractEndpointWriterVariableNameContext {

    private final GeneratedWrappedRequest generatedWrappedRequest;
    private final SdkRequest sdkRequest;

    private final String requestParameterName;

    public WrappedRequestEndpointWriterVariableNameContext(
            ClientGeneratorContext clientGeneratorContext,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            SdkRequest sdkRequest,
            GeneratedWrappedRequest generatedWrappedRequest) {
        super(clientGeneratorContext, httpService, httpEndpoint);
        this.generatedWrappedRequest = generatedWrappedRequest;
        this.sdkRequest = sdkRequest;
        this.requestParameterName =
                sdkRequest.getRequestParameterName().getCamelCase().getSafeName();
        initializeCollections();
    }

    @Override
    public Optional<SdkRequest> sdkRequest() {
        return Optional.of(this.sdkRequest);
    }

    @Override
    public List<EnrichedObjectProperty> getQueryParams() {
        return generatedWrappedRequest.queryParams();
    }

    @Override
    public List<ParameterSpec> additionalParameters() {
        List<ParameterSpec> parameterSpecs = new ArrayList<>();
        if (generatedWrappedRequest.requestBodyGetter().isPresent()
                && generatedWrappedRequest.requestBodyGetter().get()
                        instanceof GeneratedWrappedRequest.FileUploadRequestBodyGetters) {
            GeneratedWrappedRequest.FileUploadRequestBodyGetters fileUploadRequest =
                    (GeneratedWrappedRequest.FileUploadRequestBodyGetters)
                            (generatedWrappedRequest.requestBodyGetter().get());
            if (!clientGeneratorContext.getCustomConfig().inlineFileProperties()) {
                fileUploadRequest.fileProperties().forEach(fileProperty -> {
                    ParameterSpec fileParameter = ParameterSpec.builder(
                                    fileProperty.visit(new FilePropertyIsOptional())
                                            ? ParameterizedTypeName.get(Optional.class, File.class)
                                            : ClassName.get(File.class),
                                    getFilePropertyParameterName(clientGeneratorContext, fileProperty))
                            .build();
                    parameterSpecs.add(fileParameter);
                });
            }
        }
        parameterSpecs.add(requestParameterSpec().get());
        return parameterSpecs;
    }

    @Override
    public Optional<ParameterSpec> requestParameterSpec() {
        return Optional.of(ParameterSpec.builder(generatedWrappedRequest.getClassName(), requestParameterName)
                .build());
    }

    public static String getFilePropertyParameterName(
            ClientGeneratorContext clientGeneratorContext, FileProperty fileProperty) {
        if (clientGeneratorContext.getCustomConfig().inlineFileProperties()) {
            return "request.get"
                    + fileProperty
                            .visit(new GetFilePropertyKey())
                            .getName()
                            .getPascalCase()
                            .getSafeName() + "()";
        } else {
            return fileProperty
                    .visit(new GetFilePropertyKey())
                    .getName()
                    .getCamelCase()
                    .getSafeName();
        }
    }

    @Override
    public Optional<TypeName> getBodyTypeName() {
        if (generatedWrappedRequest.requestBodyGetter().isPresent()) {
            GeneratedWrappedRequest.RequestBodyGetter bodyGetter =
                    generatedWrappedRequest.requestBodyGetter().get();
            // For inlined bodies, return empty so body-only overloads are skipped
            // (inlined bodies don't have a standalone type)
            if (bodyGetter instanceof GeneratedWrappedRequest.InlinedRequestBodyGetters) {
                return Optional.empty();
            } else if (bodyGetter instanceof GeneratedWrappedRequest.ReferencedRequestBodyGetter) {
                GeneratedWrappedRequest.ReferencedRequestBodyGetter referencedGetter =
                        (GeneratedWrappedRequest.ReferencedRequestBodyGetter) bodyGetter;
                return Optional.of(referencedGetter.requestBodyGetter().returnType);
            }
        }
        return Optional.empty();
    }

    @Override
    public String getBodyParameterName() {
        if (generatedWrappedRequest.requestBodyGetter().isPresent()) {
            GeneratedWrappedRequest.RequestBodyGetter bodyGetter =
                    generatedWrappedRequest.requestBodyGetter().get();
            if (bodyGetter instanceof GeneratedWrappedRequest.ReferencedRequestBodyGetter) {
                GeneratedWrappedRequest.ReferencedRequestBodyGetter referencedGetter =
                        (GeneratedWrappedRequest.ReferencedRequestBodyGetter) bodyGetter;
                // Convert getter name (e.g., "getBody") to parameter name (e.g., "body")
                String getterName = referencedGetter.requestBodyGetter().name;
                if (getterName.startsWith("get") && getterName.length() > 3) {
                    return Character.toLowerCase(getterName.charAt(3)) + getterName.substring(4);
                }
                return getterName;
            }
        }
        return "body";
    }

    @Override
    public String getBodyPropertyName() {
        if (generatedWrappedRequest.requestBodyGetter().isPresent()) {
            GeneratedWrappedRequest.RequestBodyGetter bodyGetter =
                    generatedWrappedRequest.requestBodyGetter().get();
            if (bodyGetter instanceof GeneratedWrappedRequest.ReferencedRequestBodyGetter) {
                GeneratedWrappedRequest.ReferencedRequestBodyGetter referencedGetter =
                        (GeneratedWrappedRequest.ReferencedRequestBodyGetter) bodyGetter;
                // Convert getter name (e.g., "getBody") to property name (e.g., "body")
                String getterName = referencedGetter.requestBodyGetter().name;
                if (getterName.startsWith("get") && getterName.length() > 3) {
                    return Character.toLowerCase(getterName.charAt(3)) + getterName.substring(4);
                }
                return getterName;
            }
        }
        return "body";
    }

    @Override
    public Optional<TypeName> getWrapperTypeName() {
        return Optional.of(generatedWrappedRequest.getClassName());
    }
}
