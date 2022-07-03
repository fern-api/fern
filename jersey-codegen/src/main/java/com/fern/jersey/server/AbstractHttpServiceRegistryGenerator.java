package com.fern.jersey.server;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.Generator;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.glassfish.jersey.server.ResourceConfig;

public final class AbstractHttpServiceRegistryGenerator extends Generator {

    private static final String ABSTRACT_SERVICE_REGISTRY_CLASSSNAME = "AbstractServiceRegistry";
    private static final String JERSEY_REGISTER_METHOD_NAME = "register";

    private final ClassName abstractServiceRegistryClassName;
    private final List<GeneratedHttpServiceServer> generatedHttpServiceServers;

    public AbstractHttpServiceRegistryGenerator(
            GeneratorContext generatorContext, List<GeneratedHttpServiceServer> generatedHttpServiceServers) {
        super(generatorContext, PackageType.SERVER);
        this.abstractServiceRegistryClassName = generatorContext
                .getClassNameUtils()
                .getClassName(
                        ABSTRACT_SERVICE_REGISTRY_CLASSSNAME,
                        Optional.empty(),
                        Optional.of(packageType),
                        Optional.empty());
        this.generatedHttpServiceServers = generatedHttpServiceServers;
    }

    @Override
    public GeneratedFile generate() {
        MethodSpec.Builder serviceRegistryConstructor = MethodSpec.constructorBuilder();
        List<MethodSpec> serviceRegisterMethods = generatedHttpServiceServers.stream()
                .map(generatedHttpServiceServer -> {
                    ClassName httpServiceClassName = generatedHttpServiceServer.className();
                    String methodName = "register" + httpServiceClassName.simpleName();
                    MethodSpec registerServiceMethod = MethodSpec.methodBuilder(methodName)
                            .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                            .returns(httpServiceClassName)
                            .build();
                    serviceRegistryConstructor.addStatement(
                            "$L($N())", JERSEY_REGISTER_METHOD_NAME, registerServiceMethod);
                    return registerServiceMethod;
                })
                .collect(Collectors.toList());
        TypeSpec abstractServiceRegistryTypespec = TypeSpec.classBuilder(abstractServiceRegistryClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .superclass(ClassName.get(ResourceConfig.class))
                .addMethod(serviceRegistryConstructor.build())
                .addMethods(serviceRegisterMethods)
                .build();
        JavaFile abstractServiceRegistryFile = JavaFile.builder(
                        abstractServiceRegistryClassName.packageName(), abstractServiceRegistryTypespec)
                .build();
        return GeneratedFile.builder()
                .file(abstractServiceRegistryFile)
                .className(abstractServiceRegistryClassName)
                .build();
    }
}
