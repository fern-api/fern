package com.fern.java;

import com.fern.generator.exec.model.logging.GeneratorUpdate;
import com.fern.generator.exec.model.logging.LogLevel;
import com.fern.generator.exec.model.logging.LogUpdate;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Wrapper to run the Java V2 generator from this (the V1) generator. */
public class JavaV2Adapter {

    private static final Logger log = LoggerFactory.getLogger(JavaV2Adapter.class);

    private static final String NODE = "/usr/local/bin/node";

    /**
     * Execute the Java V2 generator with the provided arguments.
     *
     * @param args Arguments to invoke the Java V2 generator.
     */
    public static void run(DefaultGeneratorExecClient execClient, JavaV2Arguments args) {
        try {
            String[] command = new String[] {
                NODE, args.executable().toString(), args.generatorConfig().toString()
            };
            Process v2 = Runtime.getRuntime().exec(command);

            // Print the logs from the v2 process to System.out
            try (BufferedReader stdOut = new BufferedReader(new InputStreamReader(v2.getInputStream()));
                    BufferedReader stdErr = new BufferedReader(new InputStreamReader(v2.getErrorStream()))) {
                String line;
                while ((line = stdOut.readLine()) != null) {
                    System.out.println("[Java V2 STDOUT] " + line);
                }
                while ((line = stdErr.readLine()) != null) {
                    System.out.println("[Java V2 STDERR] " + line);
                }
            }
            int exitCode = v2.waitFor();
            if (exitCode == 0) {
                log.info("Successfully ran Java V2 generator");
            } else {
                execClient.sendUpdate(GeneratorUpdate.log(LogUpdate.builder()
                        .level(LogLevel.ERROR)
                        .message("Java V2 generator exited with code " + exitCode)
                        .build()));
                throw new RuntimeException("Java V2 generator exited with code " + exitCode);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
