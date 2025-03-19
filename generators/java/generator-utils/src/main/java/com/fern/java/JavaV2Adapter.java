package com.fern.java;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
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
    public static void run(JavaV2Arguments args) {
        try {
            String[] command = new String[] {
                NODE, args.executable().toString(), args.generatorConfig().toString()
            };
            Process v2 = Runtime.getRuntime().exec(command);

            try (InputStream v2Result = v2.getInputStream()) {
                BufferedReader resultReader = new BufferedReader(new InputStreamReader(v2Result));
                String line;
                while ((line = resultReader.readLine()) != null) {
                    log.debug("Java V2: {}", line);
                }
            }

            int exitCode = v2.waitFor();
            if (exitCode == 0) {
                log.info("Successfully ran Java V2 generator");
            } else {
                throw new RuntimeException("Java V2 generator exited with code " + exitCode);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
