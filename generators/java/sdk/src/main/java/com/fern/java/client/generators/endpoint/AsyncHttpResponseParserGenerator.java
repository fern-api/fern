package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.CodeBlock;
import java.util.concurrent.CompletableFuture;

public final class AsyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

    @Override
    public void addNoBodySuccessResponse(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder.addStatement("$T.complete(null)", CompletableFuture.class);
        httpResponseBuilder.addStatement("return");
    }
}
