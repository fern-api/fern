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

import com.fern.codegen.GeneratedFile;
import com.fern.java.test.TestConstants;
import org.junit.jupiter.api.Test;

public class DefaultExceptionMapperGeneratorTest {

    @Test
    public void test_basic() {
        DefaultExceptionMapperGenerator defaultExceptionMapperGenerator =
                new DefaultExceptionMapperGenerator(TestConstants.GENERATOR_CONTEXT);
        GeneratedFile defaultExceptionMapper = defaultExceptionMapperGenerator.generate();
        System.out.println(defaultExceptionMapper.file().toString());
    }
}
