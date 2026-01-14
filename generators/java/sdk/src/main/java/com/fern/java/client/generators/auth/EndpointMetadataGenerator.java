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
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import javax.lang.model.element.Modifier;

/**
 * Generates the EndpointMetadata class that holds security requirements for an endpoint.
 * This is passed to AuthProvider.getAuthHeaders() at request time.
 */
public final class EndpointMetadataGenerator extends AbstractFileGenerator {

    public EndpointMetadataGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("EndpointMetadata"), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        // Type: List<Map<String, List<String>>>
        // Outer list = OR (alternative security requirements)
        // Map keys = scheme names (e.g., "Bearer", "ApiKey")
        // Map values = scopes required for that scheme
        ParameterizedTypeName scopesType = ParameterizedTypeName.get(
                ClassName.get(List.class), ClassName.get(String.class));
        ParameterizedTypeName schemeMapType = ParameterizedTypeName.get(
                ClassName.get(Map.class), ClassName.get(String.class), scopesType);
        ParameterizedTypeName securityType = ParameterizedTypeName.get(
                ClassName.get(List.class), schemeMapType);

        FieldSpec securityField = FieldSpec.builder(securityType, "security", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        TypeSpec endpointMetadataClass = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addJavadoc("Metadata about an endpoint, including its security requirements.\n")
                .addJavadoc("Security is represented as a list of alternative requirements (OR).\n")
                .addJavadoc("Each requirement is a map of scheme names to required scopes (AND).\n")
                .addField(securityField)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(securityType, "security")
                        .addStatement("this.$N = security", securityField)
                        .build())
                .addMethod(MethodSpec.methodBuilder("getSecurity")
                        .addModifiers(Modifier.PUBLIC)
                        .addJavadoc("Returns the security requirements for this endpoint.\n")
                        .addJavadoc("@return list of alternative security requirement sets\n")
                        .returns(securityType)
                        .addStatement("return this.$N", securityField)
                        .build())
                .addMethod(MethodSpec.methodBuilder("empty")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addJavadoc("Creates an EndpointMetadata with no security requirements.\n")
                        .returns(className)
                        .addStatement("return new $T($T.of())", className, List.class)
                        .build())
                .build();

        JavaFile javaFile = JavaFile.builder(className.packageName(), endpointMetadataClass)
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }
}
