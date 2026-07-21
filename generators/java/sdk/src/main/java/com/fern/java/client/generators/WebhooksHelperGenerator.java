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
import com.fern.ir.model.webhooks.WebhookBodyHashAlgorithm;
import com.fern.ir.model.webhooks.WebhookBodyHashBinding;
import com.fern.ir.model.webhooks.WebhookBodyHashQueryParameterLocation;
import com.fern.ir.model.webhooks.WebhookName;
import com.fern.ir.model.webhooks.WebhookNotificationUrlNormalization;
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
import com.squareup.javapoet.WildcardTypeName;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
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

    public static boolean requiresBodyHashUtility(ClientGeneratorContext context) {
        for (com.fern.ir.model.webhooks.WebhookGroup webhookGroup :
                context.getIr().getWebhookGroups().values()) {
            for (Webhook webhook : webhookGroup.get()) {
                boolean present = webhook.getSignatureVerification()
                        .flatMap(verification -> verification.getHmac())
                        .flatMap(HmacSignatureVerification::getBodyHashBinding)
                        .isPresent();
                if (present) {
                    return true;
                }
            }
        }
        return false;
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
        // A verification helper returns a boolean and never throws, so missing inputs fail closed with `false`.
        MethodSpec.Builder method = MethodSpec.methodBuilder("verifySignature")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(TypeName.BOOLEAN)
                .addJavadoc(buildJavadoc())
                .addParameters(buildParameters(String.class))
                .beginControlFlow(
                        "if (requestBody == null || requestBody.isEmpty() || signatureHeader == null || signatureHeader.isEmpty() || signatureKey == null || signatureKey.isEmpty())")
                .addStatement("return false")
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

        // Notification-URL normalization: some providers (e.g. Twilio) are inconsistent about the signed URL's port and
        // query encoding, so verify against several normalized URL forms and accept on the first constant-time match.
        if (config.getNotificationUrlNormalization().isPresent()) {
            addNormalizedHmacVerification(
                    method,
                    signatureExpression,
                    config.getNotificationUrlNormalization().get(),
                    "requestBody");
            return method.build();
        }

        if (config.getBodyHashBinding().isPresent()) {
            // Body-hash binding (e.g. Twilio): the same endpoint accepts both classic form-encoded and JSON requests, so
            // branch at runtime on whether the body-hash query parameter is present in the notification URL.
            //   - present (JSON): the signed payload is the URL only; additionally recompute hash(rawBody) and
            //     constant-time compare it to the transmitted value.
            //   - absent (classic form): the signed payload is the URL + form params, with no body-hash check.
            addBodyHashBranchedPayloadConstruction(
                    method, config.getBodyHashBinding().get(), "requestBody");
        } else {
            addPayloadConstruction(method, config.getPayloadFormat(), "requestBody", "notificationUrl");
        }

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
        // Multi-value form params: request body may be provided as a map of param -> String or Collection<String>. Keys
        // are sorted; per key, values are deduped and sorted, then concatenated as `key + value` with no separator,
        // mirroring Twilio's toFormUrlEncodedParam. The flattened string is then verified via the raw-string overload.
        MethodSpec.Builder method = MethodSpec.methodBuilder("verifySignature")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(TypeName.BOOLEAN)
                .addJavadoc(buildJavadoc())
                .addParameters(buildParameters(ParameterizedTypeName.get(
                        ClassName.get(Map.class),
                        ClassName.get(String.class),
                        WildcardTypeName.subtypeOf(Object.class))))
                .beginControlFlow("if (requestBody == null)")
                .addStatement("return false")
                .endControlFlow();

        addBodyStringAssignment(method, "requestBody", "bodyString");

        CodeBlock.Builder invocation = CodeBlock.builder().add("return verifySignature(bodyString");
        for (ParameterSpec parameter : buildAdditionalParameters()) {
            invocation.add(", $L", parameter.name);
        }
        invocation.add(")");
        method.addStatement(invocation.build());
        return method.build();
    }

    /**
     * Emits the {@code String <target> = ...} flattening of a form-parameter map into a signed string. Keys are sorted
     * (map keys are inherently unique), and for each key the values are deduped and sorted, concatenating {@code key +
     * value} for every value with no delimiter between params. Values may be a {@code String} or a {@code
     * Collection<String>}.
     */
    private void addBodyStringAssignment(MethodSpec.Builder method, String mapExpr, String targetName) {
        method.addStatement("$T $LBuilder = new $T()", StringBuilder.class, targetName, StringBuilder.class)
                .beginControlFlow("for ($T $LKey : new $T<>($L.keySet()))", String.class, targetName, TreeSet.class, mapExpr)
                .addStatement("$T $LValue = $L.get($LKey)", Object.class, targetName, mapExpr, targetName)
                .addStatement("$T<$T> $LValues = new $T<>()", TreeSet.class, String.class, targetName, TreeSet.class)
                .beginControlFlow("if ($LValue instanceof $T)", targetName, Iterable.class)
                .beginControlFlow(
                        "for ($T $LItem : ($T<?>) $LValue)", Object.class, targetName, Iterable.class, targetName)
                .addStatement("$LValues.add($T.valueOf($LItem))", targetName, String.class, targetName)
                .endControlFlow()
                .nextControlFlow("else")
                .addStatement("$LValues.add($T.valueOf($LValue))", targetName, String.class, targetName)
                .endControlFlow()
                .beginControlFlow("for ($T $LSortedValue : $LValues)", String.class, targetName, targetName)
                .addStatement("$LBuilder.append($LKey).append($LSortedValue)", targetName, targetName, targetName)
                .endControlFlow()
                .endControlFlow()
                .addStatement("$T $L = $LBuilder.toString()", String.class, targetName, targetName);
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
        // A missing or malformed timestamp header fails closed with `false` (the helper never throws).
        method.beginControlFlow("if (timestampHeader == null || timestampHeader.isEmpty())")
                .addStatement("return false")
                .endControlFlow()
                .addStatement("$T timestampMs", TypeName.LONG);

        switch (timestamp.getFormat().getEnumValue()) {
            case UNIX_SECONDS:
                method.beginControlFlow("try")
                        .addStatement("timestampMs = $T.parseLong(timestampHeader) * 1000", Long.class)
                        .nextControlFlow("catch ($T exception)", NumberFormatException.class)
                        .addStatement("return false")
                        .endControlFlow();
                break;
            case UNIX_MILLIS:
                method.beginControlFlow("try")
                        .addStatement("timestampMs = $T.parseLong(timestampHeader)", Long.class)
                        .nextControlFlow("catch ($T exception)", NumberFormatException.class)
                        .addStatement("return false")
                        .endControlFlow();
                break;
            case ISO_8601:
                method.beginControlFlow("try")
                        .addStatement("timestampMs = $T.parse(timestampHeader).toEpochMilli()", Instant.class)
                        .nextControlFlow("catch ($T exception)", DateTimeParseException.class)
                        .addStatement("return false")
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

    /**
     * Emits the runtime branch for a body-hash binding. The same endpoint can receive either a JSON request (body-hash
     * query parameter present) or a classic form-encoded request (absent), so the signed payload is assembled
     * differently at runtime and only the JSON path performs the separate body-hash comparison. Assigns {@code String
     * payload}.
     */
    private void addBodyHashBranchedPayloadConstruction(
            MethodSpec.Builder method, WebhookBodyHashBinding binding, String rawBodyExpr) {
        String paramName = getBodyHashQueryParameterName(binding);
        boolean hasNotificationUrl = config.getPayloadFormat().getComponents().stream()
                .anyMatch(component -> component.getEnumValue() == WebhookPayloadComponent.Value.NOTIFICATION_URL);
        if (!hasNotificationUrl) {
            throw new IllegalArgumentException(
                    "Webhook body hash query-parameter binding requires the notification URL as a payload component");
        }
        ClassName bodyHashClass = generatorContext.getPoetClassNameFactory().getCoreClassName("WebhookBodyHash");
        ClassName signatureClass = generatorContext.getPoetClassNameFactory().getCoreClassName("WebhookSignature");

        method.addStatement(
                "$T transmittedBodyHash = $T.getQueryParameter(notificationUrl, $S)",
                String.class,
                bodyHashClass,
                paramName);
        method.addStatement("$T payload", String.class);
        method.beginControlFlow("if (transmittedBodyHash != null)");
        // JSON path: the URL alone is the signed payload; the raw body is transmitted as a separately-recomputed hash
        // and compared in constant time. Both must pass.
        method.addStatement(
                "$T expectedBodyHash = $T.computeHash($L, $S, $S)",
                String.class,
                bodyHashClass,
                rawBodyExpr,
                mapBodyHashAlgorithm(binding.getAlgorithm()),
                mapEncoding(binding.getEncoding()));
        method.beginControlFlow(
                        "if (!$T.timingSafeEqual(expectedBodyHash, transmittedBodyHash))", signatureClass)
                .addStatement("return false")
                .endControlFlow();
        method.addStatement("payload = notificationUrl");
        method.nextControlFlow("else");
        // Classic form path: URL + form params, no body-hash check.
        CodeBlock formPayload = buildPayloadExpression(config.getPayloadFormat(), "requestBody", "notificationUrl");
        method.addStatement("payload = $L", formPayload);
        method.endControlFlow();
    }

    /**
     * Emits HMAC verification against several normalized notification-URL forms, accepting on the first constant-time
     * match. The body-hash check (when configured) runs once above the loop because it does not depend on URL
     * normalization; only the HMAC over the URL is recomputed per candidate.
     */
    private void addNormalizedHmacVerification(
            MethodSpec.Builder method,
            String signatureExpression,
            WebhookNotificationUrlNormalization normalization,
            String rawBodyExpr) {
        ClassName signatureClass = generatorContext.getPoetClassNameFactory().getCoreClassName("WebhookSignature");
        boolean hasBodyHashBinding = config.getBodyHashBinding().isPresent();

        // Body-hash check (once, independent of URL normalization). Only the JSON request carries the transmitted hash;
        // when present it must match hash(rawBody).
        if (hasBodyHashBinding) {
            WebhookBodyHashBinding binding = config.getBodyHashBinding().get();
            ClassName bodyHashClass = generatorContext.getPoetClassNameFactory().getCoreClassName("WebhookBodyHash");
            method.addStatement(
                    "$T transmittedBodyHash = $T.getQueryParameter(notificationUrl, $S)",
                    String.class,
                    bodyHashClass,
                    getBodyHashQueryParameterName(binding));
            method.beginControlFlow("if (transmittedBodyHash != null)");
            method.addStatement(
                    "$T expectedBodyHash = $T.computeHash($L, $S, $S)",
                    String.class,
                    bodyHashClass,
                    rawBodyExpr,
                    mapBodyHashAlgorithm(binding.getAlgorithm()),
                    mapEncoding(binding.getEncoding()));
            method.beginControlFlow(
                            "if (!$T.timingSafeEqual(expectedBodyHash, transmittedBodyHash))", signatureClass)
                    .addStatement("return false")
                    .endControlFlow();
            method.endControlFlow();
        }

        // Build the candidate URL list and OR the per-candidate signature comparisons. The BODY component references
        // `requestBody`, which the map overload has already flattened into the sorted/deduped form string.
        method.addStatement(
                "$T<$T> candidates = $T.notificationUrlCandidates(notificationUrl, $L, $L)",
                List.class,
                String.class,
                signatureClass,
                normalization.getPortVariants(),
                normalization.getLegacyQueryEncoding());
        method.beginControlFlow("for ($T candidateUrl : candidates)", String.class);
        CodeBlock formPayload = buildPayloadExpression(config.getPayloadFormat(), "requestBody", "candidateUrl");
        if (hasBodyHashBinding) {
            // JSON request signs the URL only; classic form request signs URL + params.
            method.addStatement(
                    "$T payload = transmittedBodyHash != null ? candidateUrl : $L", String.class, formPayload);
        } else {
            method.addStatement("$T payload = $L", String.class, formPayload);
        }
        method.addStatement(
                "$T expected = $T.computeHmacSignature(payload, signatureKey, $S, $S)",
                String.class,
                signatureClass,
                mapHmacAlgorithm(config.getAlgorithm()),
                mapEncoding(config.getEncoding()));
        method.beginControlFlow("if ($T.timingSafeEqual($L, expected))", signatureClass, signatureExpression)
                .addStatement("return true")
                .endControlFlow();
        method.endControlFlow();
        method.addStatement("return false");
    }

    private void addPayloadConstruction(
            MethodSpec.Builder method, WebhookPayloadFormat payloadFormat, String rawBodyExpr, String urlExpr) {
        CodeBlock expression = buildPayloadExpression(payloadFormat, rawBodyExpr, urlExpr);
        method.addStatement("$T payload = $L", String.class, expression);
    }

    /**
     * Builds the RHS expression for the payload from the configured components. {@code bodyExpr} is the identifier for
     * the BODY component and {@code urlExpr} for the NOTIFICATION_URL component (the candidate loop substitutes {@code
     * candidateUrl}).
     */
    private CodeBlock buildPayloadExpression(WebhookPayloadFormat payloadFormat, String bodyExpr, String urlExpr) {
        List<String> componentExpressions = new ArrayList<>();
        for (WebhookPayloadComponent component : payloadFormat.getComponents()) {
            switch (component.getEnumValue()) {
                case BODY:
                    componentExpressions.add(bodyExpr);
                    break;
                case TIMESTAMP:
                    componentExpressions.add("timestampHeader");
                    break;
                case NOTIFICATION_URL:
                    componentExpressions.add(urlExpr);
                    break;
                case MESSAGE_ID:
                    componentExpressions.add("messageId");
                    break;
                case UNKNOWN:
                default:
                    throw new IllegalArgumentException("Unrecognized webhook payload component: " + component);
            }
        }

        if (componentExpressions.size() == 1) {
            return CodeBlock.of("$L", componentExpressions.get(0));
        }

        CodeBlock.Builder payload =
                CodeBlock.builder().add("$T.join($S", String.class, payloadFormat.getDelimiter());
        for (String componentExpression : componentExpressions) {
            payload.add(", $L", componentExpression);
        }
        payload.add(")");
        return payload.build();
    }

    private static String getBodyHashQueryParameterName(WebhookBodyHashBinding binding) {
        WebhookBodyHashQueryParameterLocation location = binding.getLocation()
                .getQueryParameter()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unsupported webhook body hash location: " + binding.getLocation()));
        return location.getName();
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
                    "When a map is provided, keys are sorted and each key's values are deduped and sorted, then concatenated as key-value pairs before signing.\n");
        }
        if (config.getBodyHashBinding().isPresent()) {
            javadoc.append(
                    "This helper verifies both classic form-encoded and JSON requests: it branches at runtime on whether the body-hash query parameter is present on the notification URL.\n");
            javadoc.append(
                    "For a JSON request the raw body is verified against that separately-transmitted hash and the signature is checked over the notification URL only.\n");
        }
        if (config.getNotificationUrlNormalization().isPresent()) {
            javadoc.append(
                    "The signature is verified against several normalized forms of the notification URL, succeeding if any candidate matches.\n");
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

    private static String mapBodyHashAlgorithm(WebhookBodyHashAlgorithm algorithm) {
        switch (algorithm.getEnumValue()) {
            case SHA_1:
                return "SHA-1";
            case SHA_256:
                return "SHA-256";
            case SHA_384:
                return "SHA-384";
            case SHA_512:
                return "SHA-512";
            case UNKNOWN:
            default:
                throw new IllegalArgumentException("Unrecognized webhook body hash algorithm: " + algorithm);
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
