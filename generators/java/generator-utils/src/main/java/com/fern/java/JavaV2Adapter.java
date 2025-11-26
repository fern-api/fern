package com.fern.java;

import static com.fern.java.GeneratorLogging.log;

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

    private static final String NODE = "/usr/local/bin/node";

    /**
     * Execute the Java V2 generator with the provided arguments.
     *
     * @param args Arguments to invoke the Java V2 generator.
     */
    public static void run(DefaultGeneratorExecClient execClient, JavaV2Arguments args) {
        log(execClient, "Starting java v2 sdk generation");
        try {
            log(execClient, "Generating command for java v2 sdk generation");
            String[] command = new String[] {
                NODE, args.executable().toString(), args.generatorConfig().toString()
            };
            log(execClient, "Generated command for java v2 sdk generation: " + Arrays.asList(command));
            log(execClient, "Calling java v2 generator");
            Process v2 = Runtime.getRuntime().exec(command);
            log(execClient, "Called java v2 generator");

            if (args.enableLogging()) {
                try (InputStream v2Result = v2.getInputStream()) {
                    BufferedReader resultReader = new BufferedReader(new InputStreamReader(v2Result));
                    String line;
                    while ((line = resultReader.readLine()) != null) {
                        log.debug("Java V2: {}", line);
                    }
                }
            }

            log(execClient, "Awaiting java v2 generator");
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
            log(execClient, "Got exit code from java v2 generator: " + exitCode);
            if (exitCode == 0) {
                log.info("Successfully ran Java V2 generator");
                execClient.sendUpdate(GeneratorUpdate.log(LogUpdate.builder()
                        .level(LogLevel.INFO)
                        .message("Successfully ran Java V2 generator")
                        .build()));
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
