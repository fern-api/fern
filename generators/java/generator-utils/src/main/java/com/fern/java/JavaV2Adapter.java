package com.fern.java;

import com.fern.generator.exec.model.logging.GeneratorUpdate;
import com.fern.generator.exec.model.logging.LogLevel;
import com.fern.generator.exec.model.logging.LogUpdate;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Wrapper to run the Java V2 generator from this (the V1) generator. */
public class JavaV2Adapter {

    private static final Logger log = LoggerFactory.getLogger(JavaV2Adapter.class);

    private static final String DEFAULT_NODE_PATH = "/usr/local/bin/node";
    private static final String NODE_PATH_ENV_VAR = "NODE_PATH";

    private static String getNodePath() {
        String envPath = System.getenv(NODE_PATH_ENV_VAR);
        return (envPath != null && !envPath.isEmpty()) ? envPath : DEFAULT_NODE_PATH;
    }

    /**
     * Execute the Java V2 generator with the provided arguments.
     *
     * @param args Arguments to invoke the Java V2 generator.
     */
    public static void run(DefaultGeneratorExecClient execClient, JavaV2Arguments args) {
        System.out.println("Starting java v2 sdk generation");
        try {
            System.out.println("Generating command for java v2 sdk generation");
            String[] command = new String[] {
                getNodePath(), args.executable().toString(), args.generatorConfig().toString()
            };
            System.out.println("Generated command for java v2 sdk generation: " + Arrays.asList(command));
            System.out.println("Calling java v2 generator");
            Process v2 = Runtime.getRuntime().exec(command);
            System.out.println("Called java v2 generator");

            if (args.enableLogging()) {
                try (InputStream v2Result = v2.getInputStream()) {
                    BufferedReader resultReader = new BufferedReader(new InputStreamReader(v2Result));
                    String line;
                    while ((line = resultReader.readLine()) != null) {
                        System.out.println("Java V2: " + line);
                    }
                }
            }

            System.out.println("Awaiting java v2 generator");
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
            System.out.println("Got exit code from java v2 generator: " + exitCode);
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
