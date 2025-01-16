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

package com.fern.java.spring.generators;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.java.RequestBodyUtils;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.ObjectGenerator;
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.spring.SpringGeneratorContext;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class InlinedRequestBodyGenerator extends AbstractFileGenerator {

    private final InlinedRequestBody inlinedRequestBody;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final List<GeneratedJavaInterface> extendedInterfaces;

    public InlinedRequestBodyGenerator(
            HttpService httpService,
            InlinedRequestBody inlinedRequestBody,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            SpringGeneratorContext springGeneratorContext) {
        super(
                springGeneratorContext
                        .getPoetClassNameFactory()
                        .getInlinedRequestBodyClassName(httpService, inlinedRequestBody),
                springGeneratorContext);
        this.inlinedRequestBody = inlinedRequestBody;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.extendedInterfaces = inlinedRequestBody.getExtends().stream()
                .map(DeclaredTypeName::getTypeId)
                .map(allGeneratedInterfaces::get)
                .collect(Collectors.toList());
    }

    @Override
    public AbstractGeneratedJavaFile generateFile() {
        ObjectTypeDeclaration objectTypeDeclaration = ObjectTypeDeclaration.builder()
                .extraProperties(false)
                .addAllExtends(inlinedRequestBody.getExtends())
                .addAllProperties(RequestBodyUtils.convertToObjectProperties(inlinedRequestBody))
                .build();
        ObjectTypeSpecGenerator objectTypeSpecGenerator = new ObjectTypeSpecGenerator(
                objectTypeDeclaration,
                Optional.empty(),
                extendedInterfaces,
                generatorContext,
                allGeneratedInterfaces,
                className);
        ObjectGenerator objectGenerator = new ObjectGenerator(
                generatorContext,
                className,
                objectTypeSpecGenerator.generate(),
                objectTypeSpecGenerator.objectPropertyGetters(),
                objectTypeSpecGenerator.extendedPropertyGetters());
        return objectGenerator.generateFile();
    }
}
