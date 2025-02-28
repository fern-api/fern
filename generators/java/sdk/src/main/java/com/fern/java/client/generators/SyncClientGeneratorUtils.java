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
import com.fern.java.client.generators.endpoint.AbstractHttpEndpointMethodSpecFactory;
import com.fern.java.client.generators.endpoint.SyncHttpEndpointMethodSpecFactory;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import java.util.Map;

public class SyncClientGeneratorUtils extends AbstractClientGeneratorUtils {

    public SyncClientGeneratorUtils(
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
    protected ClassName clientImplName(ClassName rawClientImplName) {
        return rawClientImplName;
    }

    @Override
    protected ClassName subpackageClientImplName(Subpackage subpackage) {
        return generatorContext.getPoetClassNameFactory().getClientClassName(subpackage);
    }

    @Override
    protected AbstractHttpEndpointMethodSpecFactory endpointMethodSpecFactory(
            HttpService httpService, HttpEndpoint httpEndpoint) {
        return new SyncHttpEndpointMethodSpecFactory(
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
}
