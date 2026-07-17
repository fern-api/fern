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

package com.fern.java.client;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fern.ir.core.ObjectMappers;
import org.junit.jupiter.api.Test;

public class JavaSdkCustomConfigTest {

    private static JavaSdkCustomConfig parse(ObjectNode node) {
        return ObjectMappers.JSON_MAPPER.convertValue(node, JavaSdkCustomConfig.class);
    }

    @Test
    void serverUrlVariables_defaultsToTrueWhenAbsent() {
        ObjectNode node = ObjectMappers.JSON_MAPPER.createObjectNode();
        assertThat(parse(node).serverUrlVariables()).isTrue();
    }

    @Test
    void serverUrlVariables_respectsExplicitTrue() {
        ObjectNode node = ObjectMappers.JSON_MAPPER.createObjectNode();
        node.put("serverUrlVariables", true);
        assertThat(parse(node).serverUrlVariables()).isTrue();
    }

    @Test
    void serverUrlVariables_respectsExplicitFalse() {
        ObjectNode node = ObjectMappers.JSON_MAPPER.createObjectNode();
        node.put("serverUrlVariables", false);
        assertThat(parse(node).serverUrlVariables()).isFalse();
    }

    @Test
    void serverUrlVariables_builderDefaultsToTrue() {
        assertThat(JavaSdkCustomConfig.builder().build().serverUrlVariables()).isTrue();
    }
}
