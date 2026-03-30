package com.fern.java.client.generators;

import com.fern.ir.model.webhooks.HmacAlgorithm;
import com.fern.ir.model.webhooks.HmacSignatureVerification;
import com.fern.ir.model.webhooks.WebhookPayloadComponent;
import com.fern.ir.model.webhooks.WebhookPayloadFormat;
import com.fern.ir.model.webhooks.WebhookSignatureEncoding;
import com.fern.ir.model.webhooks.WebhookSignatureVerification;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import javax.lang.model.element.Modifier;

public final class WebhooksHelperGenerator extends AbstractFileGenerator {

    private final WebhookSignatureVerification verification;

    public WebhooksHelperGenerator(
            AbstractGeneratorContext<?, ?> generatorContext, WebhookSignatureVerification verification) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("WebhooksHelper"), generatorContext);
        this.verification = verification;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder classBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build());

        if (verification.isHmac()) {
            HmacSignatureVerification hmac = verification.getHmac().get();
            addHmacMethods(classBuilder, hmac);
        }

        TypeSpec typeSpec = classBuilder.build();
        JavaFile javaFile = JavaFile.builder(className.packageName(), typeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private void addHmacMethods(TypeSpec.Builder classBuilder, HmacSignatureVerification hmac) {
        List<WebhookPayloadComponent> components = hmac.getPayloadFormat().getComponents();
        boolean hasNotificationUrl =
                components.stream().anyMatch(c -> c.getEnumValue() == WebhookPayloadComponent.Value.NOTIFICATION_URL);
        boolean hasBody = components.stream().anyMatch(c -> c.getEnumValue() == WebhookPayloadComponent.Value.BODY);
        boolean hasTimestamp =
                components.stream().anyMatch(c -> c.getEnumValue() == WebhookPayloadComponent.Value.TIMESTAMP);
        boolean hasMessageId =
                components.stream().anyMatch(c -> c.getEnumValue() == WebhookPayloadComponent.Value.MESSAGE_ID);

        String algorithm = mapHmacAlgorithm(hmac.getAlgorithm());
        boolean isBase64 = hmac.getEncoding().getEnumValue() == WebhookSignatureEncoding.Value.BASE_64;

        // String body overload
        classBuilder.addMethod(buildStringBodyMethod(
                hmac, algorithm, isBase64, hasNotificationUrl, hasBody, hasTimestamp, hasMessageId));

        // Map<String, String> body overload
        if (hasBody) {
            classBuilder.addMethod(
                    buildMapBodyMethod(hmac, algorithm, isBase64, hasNotificationUrl, hasTimestamp, hasMessageId));
        }
    }

    private MethodSpec buildStringBodyMethod(
            HmacSignatureVerification hmac,
            String algorithm,
            boolean isBase64,
            boolean hasNotificationUrl,
            boolean hasBody,
            boolean hasTimestamp,
            boolean hasMessageId) {
        MethodSpec.Builder method = MethodSpec.methodBuilder("verifySignature")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(boolean.class);

        if (hasBody) {
            method.addParameter(String.class, "requestBody");
        }
        method.addParameter(String.class, "signatureHeader");
        method.addParameter(String.class, "signatureKey");
        if (hasNotificationUrl) {
            method.addParameter(String.class, "notificationUrl");
        }
        if (hasTimestamp) {
            method.addParameter(String.class, "timestampHeader");
        }
        if (hasMessageId) {
            method.addParameter(String.class, "messageId");
        }

        addPayloadConstruction(method, hmac.getPayloadFormat(), "requestBody");
        addSignatureComputation(method, algorithm, isBase64);
        addSignatureComparison(method, hmac);

        return method.build();
    }

    private MethodSpec buildMapBodyMethod(
            HmacSignatureVerification hmac,
            String algorithm,
            boolean isBase64,
            boolean hasNotificationUrl,
            boolean hasTimestamp,
            boolean hasMessageId) {
        ParameterizedTypeName mapType = ParameterizedTypeName.get(
                ClassName.get(java.util.Map.class), ClassName.get(String.class), ClassName.get(String.class));

        MethodSpec.Builder method = MethodSpec.methodBuilder("verifySignature")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(boolean.class)
                .addParameter(mapType, "bodyParams")
                .addParameter(String.class, "signatureHeader")
                .addParameter(String.class, "signatureKey");

        if (hasNotificationUrl) {
            method.addParameter(String.class, "notificationUrl");
        }
        if (hasTimestamp) {
            method.addParameter(String.class, "timestampHeader");
        }
        if (hasMessageId) {
            method.addParameter(String.class, "messageId");
        }

        // Sort keys alphabetically and concatenate key+value
        method.addStatement(
                "$T<String> sortedKeys = new $T<>(bodyParams.keySet())",
                java.util.List.class,
                java.util.ArrayList.class);
        method.addStatement("$T.sort(sortedKeys)", java.util.Collections.class);
        method.addStatement("$T bodyBuilder = new $T()", StringBuilder.class, StringBuilder.class);
        method.beginControlFlow("for (String key : sortedKeys)");
        method.addStatement("bodyBuilder.append(key).append(bodyParams.get(key))");
        method.endControlFlow();
        method.addStatement("String requestBody = bodyBuilder.toString()");

        addPayloadConstruction(method, hmac.getPayloadFormat(), "requestBody");
        addSignatureComputation(method, algorithm, isBase64);
        addSignatureComparison(method, hmac);

        return method.build();
    }

    private void addPayloadConstruction(MethodSpec.Builder method, WebhookPayloadFormat payloadFormat, String bodyVar) {
        List<WebhookPayloadComponent> components = payloadFormat.getComponents();
        String delimiter = payloadFormat.getDelimiter();

        if (components.size() == 1 && components.get(0).getEnumValue() == WebhookPayloadComponent.Value.BODY) {
            method.addStatement("String payload = $L", bodyVar);
            return;
        }

        List<String> componentExprs = new ArrayList<>();
        for (WebhookPayloadComponent component : components) {
            switch (component.getEnumValue()) {
                case BODY:
                    componentExprs.add(bodyVar);
                    break;
                case NOTIFICATION_URL:
                    componentExprs.add("notificationUrl");
                    break;
                case TIMESTAMP:
                    componentExprs.add("timestampHeader");
                    break;
                case MESSAGE_ID:
                    componentExprs.add("messageId");
                    break;
                default:
                    break;
            }
        }

        if (delimiter.isEmpty()) {
            method.addStatement("String payload = " + String.join(" + ", componentExprs));
        } else {
            method.addStatement(
                    "String payload = $T.join($S, $L)", String.class, delimiter, String.join(", ", componentExprs));
        }
    }

    private void addSignatureComputation(MethodSpec.Builder method, String algorithm, boolean isBase64) {
        method.beginControlFlow("try");
        method.addStatement("$T mac = $T.getInstance($S)", javax.crypto.Mac.class, javax.crypto.Mac.class, algorithm);
        method.addStatement(
                "mac.init(new $T(signatureKey.getBytes($T.UTF_8), $S))",
                javax.crypto.spec.SecretKeySpec.class,
                java.nio.charset.StandardCharsets.class,
                algorithm);
        method.addStatement(
                "byte[] digest = mac.doFinal(payload.getBytes($T.UTF_8))", java.nio.charset.StandardCharsets.class);

        if (isBase64) {
            method.addStatement("String expected = $T.getEncoder().encodeToString(digest)", java.util.Base64.class);
        } else {
            method.addStatement("$T hexBuilder = new $T()", StringBuilder.class, StringBuilder.class);
            method.beginControlFlow("for (byte b : digest)");
            method.addStatement("hexBuilder.append($T.format($S, b))", String.class, "%02x");
            method.endControlFlow();
            method.addStatement("String expected = hexBuilder.toString()");
        }
    }

    private void addSignatureComparison(MethodSpec.Builder method, HmacSignatureVerification hmac) {
        // Strip prefix if present
        if (hmac.getSignaturePrefix().isPresent()) {
            String prefix = hmac.getSignaturePrefix().get();
            method.addStatement("String sig = signatureHeader");
            method.beginControlFlow("if (sig.startsWith($S))", prefix);
            method.addStatement("sig = sig.substring($L)", prefix.length());
            method.endControlFlow();
            method.addStatement(
                    "return $T.isEqual(expected.getBytes($T.UTF_8), sig.getBytes($T.UTF_8))",
                    java.security.MessageDigest.class,
                    java.nio.charset.StandardCharsets.class,
                    java.nio.charset.StandardCharsets.class);
        } else {
            method.addStatement(
                    "return $T.isEqual(expected.getBytes($T.UTF_8), signatureHeader.getBytes($T.UTF_8))",
                    java.security.MessageDigest.class,
                    java.nio.charset.StandardCharsets.class,
                    java.nio.charset.StandardCharsets.class);
        }

        method.nextControlFlow(
                "catch ($T | $T e)",
                java.security.NoSuchAlgorithmException.class,
                java.security.InvalidKeyException.class);
        method.addStatement("throw new $T($S, e)", RuntimeException.class, "Failed to verify webhook signature");
        method.endControlFlow();
    }

    private static String mapHmacAlgorithm(HmacAlgorithm algorithm) {
        return algorithm.visit(new HmacAlgorithm.Visitor<String>() {
            @Override
            public String visitSha1() {
                return "HmacSHA1";
            }

            @Override
            public String visitSha256() {
                return "HmacSHA256";
            }

            @Override
            public String visitSha384() {
                return "HmacSHA384";
            }

            @Override
            public String visitSha512() {
                return "HmacSHA512";
            }

            @Override
            public String visitUnknown(String unknownType) {
                throw new IllegalArgumentException("Unrecognized HMAC algorithm: " + unknownType);
            }
        });
    }
}
