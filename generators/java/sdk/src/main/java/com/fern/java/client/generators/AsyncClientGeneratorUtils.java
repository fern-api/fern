package com.fern.java.client.generators;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.ir.IPackage;
import com.fern.ir.model.ir.Subpackage;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.generators.endpoint.AbstractDelegatingHttpEndpointMethodSpecs;
import com.fern.java.client.generators.endpoint.AbstractHttpEndpointMethodSpecFactory;
import com.fern.java.client.generators.endpoint.AsyncDelegatingHttpEndpointMethodSpecs;
import com.fern.java.client.generators.endpoint.AsyncHttpEndpointMethodSpecFactory;
import com.fern.java.client.generators.endpoint.HttpEndpointMethodSpecs;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import java.util.Map;

public class AsyncClientGeneratorUtils extends AbstractClientGeneratorUtils {

    public AsyncClientGeneratorUtils(
            ClassName clientImplName,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedObjectMapper generatedObjectMapper,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            GeneratedJavaFile generatedSuppliersFile,
            GeneratedJavaFile requestOptionsFile,
            IPackage fernPackage,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        super(
                clientImplName,
                clientGeneratorContext,
                generatedClientOptions,
                generatedObjectMapper,
                generatedEnvironmentsClass,
                allGeneratedInterfaces,
                generatedSuppliersFile,
                requestOptionsFile,
                fernPackage,
                generatedErrors);
    }

    @Override
    protected AbstractDelegatingHttpEndpointMethodSpecs delegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs delegate) {
        return new AsyncDelegatingHttpEndpointMethodSpecs(delegate, RAW_CLIENT_NAME, BODY_GETTER_NAME);
    }

    @Override
    protected ClassName clientImplName(ClassName baseClientName) {
        return ClassName.get(baseClientName.packageName(), "Async" + baseClientName.simpleName());
    }

    @Override
    protected ClassName subpackageClientImplName(Subpackage subpackage) {
        ClassName syncClassName = generatorContext.getPoetClassNameFactory().getClientClassName(subpackage);
        return ClassName.get(syncClassName.packageName(), "Async" + syncClassName.simpleName());
    }

    @Override
    protected AbstractHttpEndpointMethodSpecFactory endpointMethodSpecFactory(
            HttpService httpService, HttpEndpoint httpEndpoint) {
        return new AsyncHttpEndpointMethodSpecFactory(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                generatorContext,
                generatedClientOptions,
                clientOptionsField,
                generatedEnvironmentsClass,
                allGeneratedInterfaces,
                generatedErrors);
    }

    @Override
    protected ClassName rawClientImplName(ClassName baseClientName) {
        return ClassName.get(baseClientName.packageName(), "AsyncRaw" + baseClientName.simpleName());
    }
}
