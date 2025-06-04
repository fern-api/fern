package com.fern.java.client.generators;

import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class HttpResponseGenerator extends AbstractFileGenerator {
    public HttpResponseGenerator(ClientGeneratorContext generatorContext) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getHttpResponseClassName(
                                generatorContext.getGeneratorConfig().getOrganization(),
                                generatorContext.getGeneratorConfig().getWorkspaceName(),
                                generatorContext.getCustomConfig()),
                generatorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        try (InputStream is = HttpResponseGenerator.class.getResourceAsStream("/HttpResponse.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8)
                    .replaceAll("<%= httpResponseClassName%>", className.simpleName());
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read HttpResponse.java");
        }
    }
}
