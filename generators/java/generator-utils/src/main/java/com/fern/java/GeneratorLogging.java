package com.fern.java;

import com.fern.generator.exec.model.logging.GeneratorUpdate;
import com.fern.generator.exec.model.logging.LogLevel;
import com.fern.generator.exec.model.logging.LogUpdate;

public final class GeneratorLogging {

    private GeneratorLogging() {}

    public static void log(DefaultGeneratorExecClient execClient, String message) {
        System.out.println(message);
        execClient.sendUpdate(GeneratorUpdate.log(
                LogUpdate.builder().level(LogLevel.DEBUG).message(message).build()));
    }

    public static void logError(DefaultGeneratorExecClient execClient, String message) {
        System.out.println(message);
        execClient.sendUpdate(GeneratorUpdate.log(
                LogUpdate.builder().level(LogLevel.ERROR).message(message).build()));
    }
}
