/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.client.generators.auth;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import javax.lang.model.element.Modifier;

/**
 * Generates the AuthProvider interface that all auth providers implement. This interface provides a standard way to get
 * authentication headers at request time.
 */
public final class AuthProviderGenerator extends AbstractFileGenerator {

    public AuthProviderGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("AuthProvider"), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName endpointMetadataClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("EndpointMetadata");

        TypeSpec authProviderInterface = TypeSpec.interfaceBuilder(className)
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Interface for authentication providers that can provide headers for requests.\n")
                .addJavadoc("Each implementation handles a specific authentication scheme (Bearer, Basic, etc.).\n")
                .addMethod(MethodSpec.methodBuilder("getAuthHeaders")
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .addJavadoc("Returns the authentication headers for a request.\n")
                        .addJavadoc(
                                "@param endpointMetadata metadata about the endpoint including security requirements\n")
                        .addJavadoc("@return a map of header names to header values\n")
                        .addParameter(endpointMetadataClassName, "endpointMetadata")
                        .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                        .build())
                .build();

        JavaFile javaFile =
                JavaFile.builder(className.packageName(), authProviderInterface).build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }
}
