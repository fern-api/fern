package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.CodeBlock;

public final class SyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

    @Override
    public void addNoBodySuccessResponse(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder.addStatement("return");
    }
}
