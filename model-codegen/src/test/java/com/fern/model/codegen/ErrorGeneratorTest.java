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
package com.fern.model.codegen;

import com.fern.codegen.GeneratedError;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.fern.types.ErrorDeclaration;
import com.fern.types.ErrorName;
import com.fern.types.FernFilepath;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.PrimitiveType;
import com.fern.types.Type;
import com.fern.types.TypeReference;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;

public class ErrorGeneratorTest {

    @Test
    public void test_basic() {
        ErrorGenerator errorGenerator = new ErrorGenerator(
                ErrorDeclaration.builder()
                        .name(ErrorName.builder()
                                .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                                .name("NotFoundError")
                                .build())
                        .discriminantValue("")
                        .type(Type._object(ObjectTypeDeclaration.builder()
                                .addProperties(ObjectProperty.builder()
                                        .key("a")
                                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                        .build())
                                .build()))
                        .build(),
                TestConstants.GENERATOR_CONTEXT,
                Collections.emptyMap());
        GeneratedError generatedError = errorGenerator.generate();
        System.out.println(generatedError.file().toString());
    }
}
