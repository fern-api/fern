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

package com.fern.java.client.cli;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.RemoteGeneratorEnvironment;
import com.fiddle.generator.logging.client.GeneratorLoggingServiceClient;
import com.fiddle.generator.logging.types.GeneratorUpdate;
import com.fiddle.generator.logging.types.TaskId;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public final class GeneratorLoggingClientWrapper {
    private final GeneratorLoggingServiceClient generatorLoggingServiceClient;
    private final TaskId taskId;

    public GeneratorLoggingClientWrapper(GeneratorConfig generatorConfig) {
        Optional<RemoteGeneratorEnvironment> maybeEnv =
                generatorConfig.getEnvironment().getRemote();
        this.taskId = maybeEnv.map(env -> TaskId.valueOf(env.getId().get())).orElse(null);
        this.generatorLoggingServiceClient = maybeEnv.map(RemoteGeneratorEnvironment::getCoordinatorUrl)
                .map(GeneratorLoggingServiceClient::getClient)
                .orElse(null);
    }

    public void sendUpdate(GeneratorUpdate generatorUpdate) {
        if (generatorLoggingServiceClient != null & taskId != null) {
            generatorLoggingServiceClient.sendUpdate(taskId, Collections.singletonList(generatorUpdate));
        }
    }

    public void sendUpdates(List<GeneratorUpdate> generatorUpdates) {
        if (generatorLoggingServiceClient != null & taskId != null) {
            generatorLoggingServiceClient.sendUpdate(taskId, generatorUpdates);
        }
    }
}
