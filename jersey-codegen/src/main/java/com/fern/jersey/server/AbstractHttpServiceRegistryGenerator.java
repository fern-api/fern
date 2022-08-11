/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.fern.jersey.server;

import com.fern.codegen.GeneratedAbstractHttpServiceRegistry;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.model.codegen.Generator;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.server.ResourceConfig;

public final class AbstractHttpServiceRegistryGenerator extends Generator {

    private static final String ABSTRACT_SERVICE_REGISTRY_CLASSSNAME = "AbstractServiceRegistry";
    private static final String JERSEY_REGISTER_METHOD_NAME = "register";

    private final ClassName abstractServiceRegistryClassName;
    private final List<GeneratedHttpServiceServer> generatedHttpServiceServers;
    private final List<GeneratedFile> generatedExceptionMappers;
    private final DefaultExceptionMapperGenerator defaultExceptionMapperGenerator;

    public AbstractHttpServiceRegistryGenerator(
            GeneratorContext generatorContext,
            List<GeneratedHttpServiceServer> generatedHttpServiceServers,
            List<GeneratedFile> generatedExceptionMappers) {
        super(generatorContext);
        this.abstractServiceRegistryClassName = generatorContext
                .getClassNameUtils()
                .getClassName(ABSTRACT_SERVICE_REGISTRY_CLASSSNAME, Optional.empty(), Optional.empty());
        this.generatedHttpServiceServers = generatedHttpServiceServers;
        this.generatedExceptionMappers = generatedExceptionMappers;
        this.defaultExceptionMapperGenerator = new DefaultExceptionMapperGenerator(generatorContext);
    }

    @Override
    public GeneratedAbstractHttpServiceRegistry generate() {
        MethodSpec.Builder defaultServiceRegistryConstructor =
                MethodSpec.constructorBuilder().addModifiers(Modifier.PUBLIC);

        MethodSpec.Builder argServiceRegistryConstructor =
                MethodSpec.constructorBuilder().addModifiers(Modifier.PUBLIC).addStatement("this()");

        GeneratedFile defaultExceptionMapper = defaultExceptionMapperGenerator.generate();
        defaultServiceRegistryConstructor.addStatement(
                "$L($T.class)", JERSEY_REGISTER_METHOD_NAME, defaultExceptionMapper.className());
        generatedExceptionMappers.forEach(exceptionMapper -> {
            defaultServiceRegistryConstructor.addStatement(
                    "$L($T.class)", JERSEY_REGISTER_METHOD_NAME, exceptionMapper.className());
        });

        generatedHttpServiceServers.forEach(generatedHttpServiceServer -> {
            ClassName httpServiceClassName = generatedHttpServiceServer.className();
            String parameterName = StringUtils.uncapitalize(httpServiceClassName.simpleName());
            argServiceRegistryConstructor.addParameter(httpServiceClassName, parameterName);
            argServiceRegistryConstructor.addStatement("$L($L)", JERSEY_REGISTER_METHOD_NAME, parameterName);
        });

        TypeSpec abstractServiceRegistryTypespec = TypeSpec.classBuilder(abstractServiceRegistryClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .superclass(ClassName.get(ResourceConfig.class))
                .addMethod(defaultServiceRegistryConstructor.build())
                .addMethod(argServiceRegistryConstructor.build())
                .build();
        JavaFile abstractServiceRegistryFile = JavaFile.builder(
                        abstractServiceRegistryClassName.packageName(), abstractServiceRegistryTypespec)
                .build();
        return GeneratedAbstractHttpServiceRegistry.builder()
                .file(abstractServiceRegistryFile)
                .className(abstractServiceRegistryClassName)
                .defaultExceptionMapper(defaultExceptionMapper)
                .build();
    }
}
