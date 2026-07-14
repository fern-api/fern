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

import com.fern.ir.model.webhooks.HmacAlgorithm;
import com.fern.ir.model.webhooks.HmacSignatureVerification;
import com.fern.ir.model.webhooks.Webhook;
import com.fern.ir.model.webhooks.WebhookName;
import com.fern.ir.model.webhooks.WebhookPayloadComponent;
import com.fern.ir.model.webhooks.WebhookPayloadFormat;
import com.fern.ir.model.webhooks.WebhookSignatureEncoding;
import com.fern.ir.model.webhooks.WebhookTimestampConfig;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.NameUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import javax.lang.model.element.Modifier;

public final class WebhooksHelperGenerator extends AbstractFileGenerator {

    private static final int DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;
    private static final String DEFAULT_HELPER_NAME = "WebhooksHelper";

    private final HmacSignatureVerification config;

    private WebhooksHelperGenerator(
            ClientGeneratorContext context, String className, HmacSignatureVerification config) {
        super(context.getPoetClassNameFactory().getRootClassName(className), context);
        this.config = config;
    }

    public static List<GeneratedJavaFile> generateFiles(ClientGeneratorContext context) {
        LinkedHashMap<HmacSignatureVerification, WebhookVerificationEntry> grouped = new LinkedHashMap<>();
        for (com.fern.ir.model.webhooks.WebhookGroup webhookGroup :
                context.getIr().getWebhookGroups().values()) {
            for (Webhook webhook : webhookGroup.get()) {
                webhook.getSignatureVerification()
                        .flatMap(verification -> verification.getHmac())
                        .ifPresent(hmac -> {
                            grouped.computeIfAbsent(hmac, ignored -> new WebhookVerificationEntry(hmac))
                                    .webhookNames
                                    .add(webhook.getName());
                        });
            }
        }

        if (grouped.isEmpty()) {
            return List.of();
        }

        WebhookVerificationEntry defaultEntry = null;
        int maxCount = -1;
        for (WebhookVerificationEntry entry : grouped.values()) {
            if (entry.webhookNames.size() > maxCount) {
                defaultEntry = entry;
                maxCount = entry.webhookNames.size();
            }
        }

        List<GeneratedJavaFile> generatedFiles = new ArrayList<>();
        generatedFiles.add(
                new WebhooksHelperGenerator(context, DEFAULT_HELPER_NAME, defaultEntry.config).generateFile());
        for (WebhookVerificationEntry entry : grouped.values()) {
            if (entry == defaultEntry) {
                continue;
            }
            String className = webhookNameToPascal(entry.webhookNames.get(0)) + DEFAULT_HELPER_NAME;
            generatedFiles.add(new WebhooksHelperGenerator(context, className, entry.config).generateFile());
        }
        return generatedFiles;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder helper = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build());

        config.getTimestamp()
                .ifPresent(timestamp -> helper.addField(FieldSpec.builder(
                                TypeName.INT,
                                "TIMESTAMP_TOLERANCE_SECONDS",
                                Modifier.PRIVATE,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer("$L", timestamp.getTolerance().orElse(DEFAULT_TIMESTAMP_TOLERANCE_SECONDS))
                        .build()));
        config.getSignaturePrefix()
                .ifPresent(prefix -> helper.addField(FieldSpec.builder(
                                String.class, "SIGNATURE_PREFIX", Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                        .initializer("$S", prefix)
                        .build()));

        helper.addMethod(buildVerifySignatureMethod());
        if (config.getPayloadFormat().getBodySort().isPresent()) {
            helper.addMethod(buildMapVerifySignatureMethod());
        }

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(JavaFile.builder(className.packageName(), helper.build())
                        .build())
                .build();
    }

    private MethodSpec buildVerifySignatureMethod() {
        MethodSpec.Builder method = MethodSpec.methodBuilder("verifySignature")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(TypeName.BOOLEAN)
                .addJavadoc(buildJavadoc())
                .addParameters(buildParameters(String.class))
                .beginControlFlow(
                        "if (requestBody == null || requestBody.isEmpty() || signatureHeader == null || signatureHeader.isEmpty() || signatureKey == null || signatureKey.isEmpty())")
                .addStatement(
                        "throw new $T($S)",
                        IllegalArgumentException.class,
                        "Missing required parameters for webhook signature verification")
                .endControlFlow();

        config.getTimestamp().ifPresent(timestamp -> addTimestampValidation(method, timestamp));

        String signatureExpression = "signatureHeader";
        if (config.getSignaturePrefix().isPresent()) {
            method.addStatement(
                    "$T signature = signatureHeader.startsWith(SIGNATURE_PREFIX)"
                            + " ? signatureHeader.substring(SIGNATURE_PREFIX.length())"
                            + " : signatureHeader",
                    String.class);
            signatureExpression = "signature";
        }

        addPayloadConstruction(method, config.getPayloadFormat());
        method.addStatement(
                        "$T expected = $T.computeHmacSignature(payload, signatureKey, $S, $S)",
                        String.class,
                        generatorContext.getPoetClassNameFactory().getCoreClassName("WebhookSignature"),
                        mapHmacAlgorithm(config.getAlgorithm()),
                        mapEncoding(config.getEncoding()))
                .addStatement(
                        "return $T.timingSafeEqual($L, expected)",
                        generatorContext.getPoetClassNameFactory().getCoreClassName("WebhookSignature"),
                        signatureExpression);
        return method.build();
    }

    private MethodSpec buildMapVerifySignatureMethod() {
        MethodSpec.Builder method = MethodSpec.methodBuilder("verifySignature")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(TypeName.BOOLEAN)
                .addJavadoc(buildJavadoc())
                .addParameters(buildParameters(ParameterizedTypeName.get(
                        ClassName.get(Map.class), ClassName.get(String.class), ClassName.get(String.class))))
                .beginControlFlow("if (requestBody == null || requestBody.isEmpty())")
                .addStatement(
                        "throw new $T($S)",
                        IllegalArgumentException.class,
                        "Missing required parameters for webhook signature verification")
                .endControlFlow()
                .addStatement("$T bodyString = new $T()", StringBuilder.class, StringBuilder.class)
                .beginControlFlow(
                        "for ($T.Entry<$T, $T> entry : new $T<>(requestBody).entrySet())",
                        Map.class,
                        String.class,
                        String.class,
                        TreeMap.class)
                .addStatement("bodyString.append(entry.getKey()).append(entry.getValue())")
                .endControlFlow();

        CodeBlock.Builder invocation = CodeBlock.builder().add("return verifySignature(bodyString.toString()");
        for (ParameterSpec parameter : buildAdditionalParameters()) {
            invocation.add(", $L", parameter.name);
        }
        invocation.add(")");
        method.addStatement(invocation.build());
        return method.build();
    }

    private List<ParameterSpec> buildParameters(TypeName requestBodyType) {
        List<ParameterSpec> parameters = new ArrayList<>();
        parameters.add(ParameterSpec.builder(requestBodyType, "requestBody").build());
        parameters.add(ParameterSpec.builder(String.class, "signatureHeader").build());
        parameters.add(ParameterSpec.builder(String.class, "signatureKey").build());
        parameters.addAll(buildPayloadParameters());
        if (config.getTimestamp().isPresent()) {
            parameters.add(
                    ParameterSpec.builder(String.class, "timestampHeader").build());
        }
        return parameters;
    }

    private List<ParameterSpec> buildParameters(Class<?> requestBodyType) {
        return buildParameters(TypeName.get(requestBodyType));
    }

    private List<ParameterSpec> buildAdditionalParameters() {
        List<ParameterSpec> parameters = new ArrayList<>();
        parameters.add(ParameterSpec.builder(String.class, "signatureHeader").build());
        parameters.add(ParameterSpec.builder(String.class, "signatureKey").build());
        parameters.addAll(buildPayloadParameters());
        if (config.getTimestamp().isPresent()) {
            parameters.add(
                    ParameterSpec.builder(String.class, "timestampHeader").build());
        }
        return parameters;
    }

    private List<ParameterSpec> buildPayloadParameters() {
        List<ParameterSpec> parameters = new ArrayList<>();
        for (WebhookPayloadComponent component : config.getPayloadFormat().getComponents()) {
            switch (component.getEnumValue()) {
                case NOTIFICATION_URL:
                    parameters.add(ParameterSpec.builder(String.class, "notificationUrl")
                            .build());
                    break;
                case MESSAGE_ID:
                    parameters.add(
                            ParameterSpec.builder(String.class, "messageId").build());
                    break;
                case BODY:
                case TIMESTAMP:
                    break;
                case UNKNOWN:
                default:
                    throw new IllegalArgumentException("Unrecognized webhook payload component: " + component);
            }
        }
        return parameters;
    }

    private void addTimestampValidation(MethodSpec.Builder method, WebhookTimestampConfig timestamp) {
        method.beginControlFlow("if (timestampHeader == null || timestampHeader.isEmpty())")
                .addStatement(
                        "throw new $T($S)",
                        IllegalArgumentException.class,
                        "Missing timestamp header '"
                                + NameUtils.getWireValue(timestamp.getHeaderName())
                                + "' for webhook signature verification")
                .endControlFlow()
                .addStatement("$T timestampMs", TypeName.LONG);

        switch (timestamp.getFormat().getEnumValue()) {
            case UNIX_SECONDS:
                method.beginControlFlow("try")
                        .addStatement("timestampMs = $T.parseLong(timestampHeader) * 1000", Long.class)
                        .nextControlFlow("catch ($T exception)", NumberFormatException.class)
                        .addStatement(
                                "throw new $T($S)",
                                IllegalArgumentException.class,
                                "Invalid timestamp format: expected unix seconds")
                        .endControlFlow();
                break;
            case UNIX_MILLIS:
                method.beginControlFlow("try")
                        .addStatement("timestampMs = $T.parseLong(timestampHeader)", Long.class)
                        .nextControlFlow("catch ($T exception)", NumberFormatException.class)
                        .addStatement(
                                "throw new $T($S)",
                                IllegalArgumentException.class,
                                "Invalid timestamp format: expected unix milliseconds")
                        .endControlFlow();
                break;
            case ISO_8601:
                method.beginControlFlow("try")
                        .addStatement("timestampMs = $T.parse(timestampHeader).toEpochMilli()", Instant.class)
                        .nextControlFlow("catch ($T exception)", DateTimeParseException.class)
                        .addStatement(
                                "throw new $T($S)",
                                IllegalArgumentException.class,
                                "Invalid timestamp format: expected ISO 8601 date string")
                        .endControlFlow();
                break;
            case UNKNOWN:
            default:
                throw new IllegalArgumentException("Unrecognized webhook timestamp format: " + timestamp.getFormat());
        }

        method.beginControlFlow(
                        "if ($T.abs($T.currentTimeMillis() - timestampMs) > TIMESTAMP_TOLERANCE_SECONDS * 1000L)",
                        Math.class,
                        System.class)
                .addStatement("return false")
                .endControlFlow();
    }

    private void addPayloadConstruction(MethodSpec.Builder method, WebhookPayloadFormat payloadFormat) {
        List<String> componentExpressions = new ArrayList<>();
        for (WebhookPayloadComponent component : payloadFormat.getComponents()) {
            switch (component.getEnumValue()) {
                case BODY:
                    componentExpressions.add("requestBody");
                    break;
                case TIMESTAMP:
                    componentExpressions.add("timestampHeader");
                    break;
                case NOTIFICATION_URL:
                    componentExpressions.add("notificationUrl");
                    break;
                case MESSAGE_ID:
                    componentExpressions.add("messageId");
                    break;
                case UNKNOWN:
                default:
                    throw new IllegalArgumentException("Unrecognized webhook payload component: " + component);
            }
        }

        if (componentExpressions.size() == 1 && componentExpressions.get(0).equals("requestBody")) {
            method.addStatement("$T payload = requestBody", String.class);
            return;
        }

        CodeBlock.Builder payload = CodeBlock.builder()
                .add("$T payload = $T.join($S", String.class, String.class, payloadFormat.getDelimiter());
        for (String componentExpression : componentExpressions) {
            payload.add(", $L", componentExpression);
        }
        payload.add(")");
        method.addStatement(payload.build());
    }

    private String buildJavadoc() {
        StringBuilder javadoc = new StringBuilder("Verify an HMAC webhook signature.\n\n");
        javadoc.append("Extract the signature from the \"")
                .append(NameUtils.getWireValue(config.getSignatureHeaderName()))
                .append("\" header and pass it as the {@code signatureHeader} parameter.\n");
        config.getTimestamp().ifPresent(timestamp -> javadoc.append("Extract the timestamp from the \"")
                .append(NameUtils.getWireValue(timestamp.getHeaderName()))
                .append("\" header and pass it as the {@code timestampHeader} parameter.\n"));
        if (config.getPayloadFormat().getBodySort().isPresent()) {
            javadoc.append(
                    "The {@code requestBody} parameter accepts either a raw string or a map of POST body parameters.\n");
            javadoc.append(
                    "When a map is provided, parameters are sorted alphabetically by key and concatenated as key-value pairs before signing.\n");
        }
        return javadoc.toString();
    }

    private static String mapHmacAlgorithm(HmacAlgorithm algorithm) {
        switch (algorithm.getEnumValue()) {
            case SHA_1:
                return "HmacSHA1";
            case SHA_256:
                return "HmacSHA256";
            case SHA_384:
                return "HmacSHA384";
            case SHA_512:
                return "HmacSHA512";
            case UNKNOWN:
            default:
                throw new IllegalArgumentException("Unrecognized HMAC algorithm: " + algorithm);
        }
    }

    private static String mapEncoding(WebhookSignatureEncoding encoding) {
        switch (encoding.getEnumValue()) {
            case BASE_64:
                return "base64";
            case HEX:
                return "hex";
            case UNKNOWN:
            default:
                throw new IllegalArgumentException("Unrecognized webhook signature encoding: " + encoding);
        }
    }

    private static String webhookNameToPascal(WebhookName webhookName) {
        return NameUtils.toName(webhookName.get()).getPascalCase().getSafeName();
    }

    private static final class WebhookVerificationEntry {
        private final HmacSignatureVerification config;
        private final List<WebhookName> webhookNames = new ArrayList<>();

        private WebhookVerificationEntry(HmacSignatureVerification config) {
            this.config = config;
        }
    }
}
