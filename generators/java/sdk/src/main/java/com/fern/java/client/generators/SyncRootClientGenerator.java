package com.fern.java.client.generators;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import java.util.Map;
import java.util.Optional;

public class SyncRootClientGenerator extends AbstractRootClientGenerator {

    public SyncRootClientGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedJavaFile generatedSuppliersFile,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedJavaFile requestOptionsFile,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            Optional<GeneratedJavaFile> generatedOAuthTokenSupplier,
            Optional<GeneratedJavaFile> generatedInferredAuthTokenSupplier,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        super(
                generatorContext,
                generatedObjectMapper,
                clientGeneratorContext,
                generatedClientOptions,
                generatedSuppliersFile,
                generatedEnvironmentsClass,
                requestOptionsFile,
                allGeneratedInterfaces,
                generatedOAuthTokenSupplier,
                generatedInferredAuthTokenSupplier,
                generatedErrors);
    }

    @Override
    protected AbstractClientGeneratorUtils clientGeneratorUtils() {
        return new SyncClientGeneratorUtils(
                className,
                clientGeneratorContext,
                generatedClientOptions,
                generatedObjectMapper,
                generatedEnvironmentsClass,
                allGeneratedInterfaces,
                generatedSuppliersFile,
                requestOptionsFile,
                generatorContext.getIr().getRootPackage(),
                generatedErrors);
    }

    @Override
    protected ClassName className() {
        return className;
    }

    @Override
    protected ClassName rawClientName() {
        return ClassName.get(className.packageName(), "Raw" + className.simpleName());
    }

    @Override
    protected ClassName builderName() {
        return ClassName.get(className.packageName(), className.simpleName() + "Builder");
    }
}
