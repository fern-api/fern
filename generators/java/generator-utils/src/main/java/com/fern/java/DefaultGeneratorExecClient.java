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

package com.fern.java;

import com.fern.generator.exec.client.FernGeneratorExecClient;
import com.fern.generator.exec.client.logging.endpoints.SendUpdate;
import com.fern.generator.exec.client.logging.exceptions.SendUpdateException;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.RemoteGeneratorEnvironment;
import com.fern.generator.exec.model.logging.GeneratorUpdate;
import com.fern.generator.exec.model.logging.TaskId;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class DefaultGeneratorExecClient {

    private static final Logger log = LoggerFactory.getLogger(DefaultGeneratorExecClient.class);

    private final FernGeneratorExecClient generatorExecClient;
    private final TaskId taskId;

    public DefaultGeneratorExecClient(GeneratorConfig generatorConfig) {
        Optional<RemoteGeneratorEnvironment> maybeEnv =
                generatorConfig.getEnvironment().getRemote();
        this.taskId = maybeEnv.map(env -> TaskId.valueOf(env.getId().get())).orElse(null);
        this.generatorExecClient = maybeEnv.map(RemoteGeneratorEnvironment::getCoordinatorUrlV2)
                .map(FernGeneratorExecClient::new)
                .orElse(null);
    }

    public void sendUpdate(GeneratorUpdate generatorUpdate) {
        sendUpdates(Collections.singletonList(generatorUpdate));
    }

    public void sendUpdates(List<GeneratorUpdate> generatorUpdates) {
        if (generatorExecClient != null & taskId != null) {
            try {
                generatorExecClient
                        .logging()
                        .sendUpdate(SendUpdate.Request.builder()
                                .taskId(taskId)
                                .body(generatorUpdates)
                                .build());
            } catch (SendUpdateException e) {
                log.error("Encountered error while sending generator update", e);
            }
        }
    }
}
