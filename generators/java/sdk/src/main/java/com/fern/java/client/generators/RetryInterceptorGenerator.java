/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.client.generators;

import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class RetryInterceptorGenerator extends AbstractFileGenerator {

    private final ClientGeneratorContext clientGeneratorContext;

    public RetryInterceptorGenerator(ClientGeneratorContext clientGeneratorContext) {
        super(clientGeneratorContext.getPoetClassNameFactory().getRetryInterceptorClassName(), clientGeneratorContext);
        this.clientGeneratorContext = clientGeneratorContext;
    }

    @Override
    public GeneratedResourcesJavaFile generateFile() {
        try (InputStream is = RetryInterceptorGenerator.class.getResourceAsStream("/RetryInterceptor.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            String retryStatusCheck = "recommended"
                            .equals(clientGeneratorContext.getCustomConfig().retryStatusCodes())
                    ? "statusCode == 408 || statusCode == 429 || statusCode == 502 || statusCode == 503 || statusCode == 504"
                    : "statusCode == 408 || statusCode == 429 || statusCode >= 500";
            contents = contents.replace("{{RETRY_STATUS_CHECK}}", retryStatusCheck);
            if (clientGeneratorContext.getCustomConfig().refreshAuthOnFailedPermissions()) {
                contents = addAuthRefresh(contents);
            }
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read RetryInterceptor.java");
        }
    }

    /**
     * Makes 401 and 403 retryable for requests tagged with {@code AuthRefresh}, and refreshes auth before each of those
     * retries. The refreshed headers are kept for any later attempt of the same call.
     */
    static String addAuthRefresh(String contents) {
        contents = replaceOnce(
                contents,
                "import java.util.Random;\n",
                "import java.util.Map;\nimport java.util.Random;\nimport java.util.TreeMap;\nimport java.util.function.Function;\n");
        contents = replaceOnce(
                contents,
                "        if (shouldRetry(response.code())) {\n            return retryChain(",
                "        if (shouldRetry(response.code()) || shouldRefreshAuth(request, response.code())) {\n"
                        + "            return retryChain(");
        contents = replaceOnce(
                contents,
                "        Optional<Duration> nextBackoff = backoff.nextBackoff(response);\n",
                "        Optional<Duration> nextBackoff = backoff.nextBackoff(response);\n"
                        + "        Request retryRequest = chain.request();\n");
        contents = replaceOnce(
                contents,
                "                callTimeout.ifPresent(AsyncTimeout::enter);\n            }\n",
                "                callTimeout.ifPresent(AsyncTimeout::enter);\n            }\n"
                        + "            if (shouldRefreshAuth(retryRequest, response.code())) {\n"
                        + "                retryRequest = refreshAuth(retryRequest, response);\n"
                        + "            }\n");
        contents = replaceOnce(
                contents,
                "                nextResponse = chain.proceed(chain.request());\n",
                "                nextResponse = chain.proceed(retryRequest);\n");
        contents = replaceOnce(
                contents,
                "            if (shouldRetry(response.code())) {\n                nextBackoff = backoff.nextBackoff(response);\n",
                "            if (shouldRetry(response.code()) || shouldRefreshAuth(retryRequest, response.code())) {\n"
                        + "                nextBackoff = backoff.nextBackoff(response);\n");
        contents = replaceOnce(
                contents,
                "    private static boolean shouldRetry(int statusCode) {\n",
                AUTH_REFRESH_MEMBERS + "    private static boolean shouldRetry(int statusCode) {\n");
        return contents;
    }

    private static String replaceOnce(String contents, String target, String replacement) {
        int index = contents.indexOf(target);
        if (index < 0 || contents.indexOf(target, index + 1) >= 0) {
            throw new IllegalStateException("Expected exactly one occurrence in RetryInterceptor.java of: " + target);
        }
        return contents.replace(target, replacement);
    }

    private static final String AUTH_REFRESH_MEMBERS = String.join(
            "\n",
            "    private static boolean shouldRefreshAuth(Request request, int statusCode) {",
            "        return (statusCode == 401 || statusCode == 403) && request.tag(AuthRefresh.class) != null;",
            "    }",
            "",
            "    /**",
            "     * Refreshes auth and returns the request with the new auth headers. If the refresh fails, the failed",
            "     * response is closed and the refresh error is thrown, so the request is not sent again.",
            "     */",
            "    private static Request refreshAuth(Request request, Response response) throws IOException {",
            "        Map<String, String> refreshedHeaders;",
            "        try {",
            "            refreshedHeaders = request.tag(AuthRefresh.class).refresh(sentHeaders(request));",
            "        } catch (RuntimeException e) {",
            "            response.close();",
            "            throw new IOException(\"Failed to refresh auth after HTTP \" + response.code(), e);",
            "        }",
            "        Request.Builder builder = request.newBuilder();",
            "        refreshedHeaders.forEach((name, value) -> {",
            "            if (value != null) {",
            "                builder.header(name, value);",
            "            } else {",
            "                builder.removeHeader(name);",
            "            }",
            "        });",
            "        return builder.build();",
            "    }",
            "",
            "    private static Map<String, String> sentHeaders(Request request) {",
            "        Map<String, String> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);",
            "        for (String name : request.headers().names()) {",
            "            headers.put(name, request.header(name));",
            "        }",
            "        return headers;",
            "    }",
            "",
            "    /**",
            "     * Carried on the OkHttp {@link Request} as a tag. On a 401 or 403 the interceptor calls",
            "     * {@link #refresh(Map)} with the headers the failed attempt sent. It drops cached credentials that still match",
            "     * them and returns the request's headers resolved again, then retries with them.",
            "     */",
            "    public static final class AuthRefresh {",
            "        private final Function<Map<String, String>, Map<String, String>> refresh;",
            "",
            "        public AuthRefresh(Function<Map<String, String>, Map<String, String>> refresh) {",
            "            this.refresh = refresh;",
            "        }",
            "",
            "        public Map<String, String> refresh(Map<String, String> failedHeaders) {",
            "            return refresh.apply(failedHeaders);",
            "        }",
            "    }",
            "",
            "");
}
