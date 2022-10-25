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

package com.fern.codegen.generator.auth;

import com.fern.codegen.GeneratedAuthSchemes;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.CasingUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.commons.WithDocs;
import com.fern.ir.model.services.http.HttpHeader;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class AllAuthGenerator extends Generator {

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String BUILD_STAGE_SUFFIX = "BuildStage";

    private final ClassName generatedClassName;
    private final ClassName generatedImmutablesClassName;
    private final List<AuthScheme> authSchemes;
    private final AuthSchemeToGeneratedFile authSchemeToGeneratedFile;

    public AllAuthGenerator(
            GeneratorContext generatorContext, PackageType packageType, String apiName, List<AuthScheme> authSchemes) {
        super(generatorContext);
        this.generatedClassName = generatorContext
                .getClassNameUtils()
                .getClassName(
                        CasingUtils.convertKebabCaseToUpperCamelCase(apiName),
                        Optional.of("Auth"),
                        Optional.empty(),
                        packageType);
        this.generatedImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(generatedClassName);
        this.authSchemes = authSchemes;
        this.authSchemeToGeneratedFile = new AuthSchemeToGeneratedFile(generatorContext, packageType);
    }

    @Override
    public GeneratedAuthSchemes generate() {
        Map<AuthScheme, GeneratedFile> generatedAuthSchemes = authSchemes.stream()
                .collect(Collectors.toMap(
                        Function.identity(), authScheme -> authScheme.visit(this.authSchemeToGeneratedFile)));
        Map<AuthScheme, MethodSpec> authPropertyMethods = authSchemes.stream()
                .collect(Collectors.toMap(Function.identity(), authScheme -> {
                    GeneratedFile generatedFile = generatedAuthSchemes.get(authScheme);
                    AuthSchemeToMethodSpec authSchemeToMethodSpec = new AuthSchemeToMethodSpec(generatedFile);
                    return authScheme.visit(authSchemeToMethodSpec);
                }));
        TypeSpec allAuthTypeSpec = TypeSpec.interfaceBuilder(generatedClassName)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(StagedBuilderImmutablesStyle.class)
                .addMethods(authSchemes.stream().map(authPropertyMethods::get).collect(Collectors.toList()))
                .addMethod(generateStaticBuilder(authPropertyMethods))
                .build();
        JavaFile allAuthFile = JavaFile.builder(generatedClassName.packageName(), allAuthTypeSpec)
                .build();
        return GeneratedAuthSchemes.builder()
                .file(allAuthFile)
                .className(generatedClassName)
                .putAllGeneratedAuthSchemes(generatedAuthSchemes)
                .build();
    }

    private static final class AuthSchemeToMethodSpec implements AuthScheme.Visitor<MethodSpec> {

        private final GeneratedFile generatedFile;

        AuthSchemeToMethodSpec(GeneratedFile generatedFile) {
            this.generatedFile = generatedFile;
        }

        @Override
        public MethodSpec visitBearer(WithDocs value) {
            return MethodSpec.methodBuilder("bearer")
                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                    .returns(generatedFile.className())
                    .build();
        }

        @Override
        public MethodSpec visitBasic(WithDocs value) {
            return MethodSpec.methodBuilder("basic")
                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                    .returns(generatedFile.className())
                    .build();
        }

        @Override
        public MethodSpec visitHeader(HttpHeader value) {
            return MethodSpec.methodBuilder(value.getName().getCamelCase())
                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                    .returns(generatedFile.className())
                    .build();
        }

        @Override
        public MethodSpec _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown auth scheme: " + unknownType);
        }
    }

    private MethodSpec generateStaticBuilder(Map<AuthScheme, MethodSpec> propertyMethods) {
        Optional<MethodSpec> firstMandatoryFieldName = getFirstRequiredProperty(propertyMethods);
        ClassName builderClassName = firstMandatoryFieldName.isEmpty()
                ? generatedImmutablesClassName.nestedClass("Builder")
                : generatedImmutablesClassName.nestedClass(
                        StringUtils.capitalize(firstMandatoryFieldName.get().name) + BUILD_STAGE_SUFFIX);
        return MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addCode("return $T.builder();", generatedImmutablesClassName)
                .build();
    }

    private static Optional<MethodSpec> getFirstRequiredProperty(Map<AuthScheme, MethodSpec> propertyMethods) {
        for (Map.Entry<AuthScheme, MethodSpec> entry : propertyMethods.entrySet()) {
            AuthScheme authScheme = entry.getKey();
            if (authScheme.isHeader()
                    && authScheme.getHeader().get().getValueType().isContainer()) {
                continue;
            }
            return Optional.of(entry.getValue());
        }
        return Optional.empty();
    }
}
