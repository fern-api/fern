package com.fern.java.client;

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.websocket.WebSocketChannel;
import com.fern.java.AbstractNonModelPoetClassNameFactory;
import com.fern.java.ICustomConfig;
import com.fern.java.utils.CasingUtils;
import com.squareup.javapoet.ClassName;
import java.util.List;
import java.util.Optional;

public final class ClientPoetClassNameFactory extends AbstractNonModelPoetClassNameFactory {

    public ClientPoetClassNameFactory(List<String> packagePrefixTokens, ICustomConfig.PackageLayout packageLayout) {
        super(packagePrefixTokens, packageLayout);
    }

    public ClassName getErrorClassName(ErrorDeclaration errorDeclaration) {
        String packageName = getErrorsPackageName(errorDeclaration.getName().getFernFilepath());
        return ClassName.get(
                packageName,
                errorDeclaration.getName().getName().getPascalCase().getSafeName());
    }

    public ClassName getInputStreamRequestBodyClassName() {
        return ClassName.get(getCorePackage(), "InputStreamRequestBody");
    }

    public ClassName getFileStreamClassName() {
        return ClassName.get(getCorePackage(), "FileStream");
    }

    public ClassName getRetryInterceptorClassName() {
        return ClassName.get(getCorePackage(), "RetryInterceptor");
    }

    public ClassName getResponseBodyInputStreamClassName() {
        return ClassName.get(getCorePackage(), "ResponseBodyInputStream");
    }

    public ClassName getResponseBodyReaderClassName() {
        return ClassName.get(getCorePackage(), "ResponseBodyReader");
    }

    public ClassName getApiVersionClassName() {
        return ClassName.get(getCorePackage(), "ApiVersion");
    }

    public ClassName getRequestOptionsClassName() {
        return ClassName.get(getCorePackage(), "RequestOptions");
    }

    public ClassName getIdempotentRequestOptionsClassName() {
        return ClassName.get(getCorePackage(), "IdempotentRequestOptions");
    }

    public ClassName getMediaTypesClassName() {
        return ClassName.get(getCorePackage(), "MediaTypes");
    }

    public ClassName getClientClassName(Subpackage subpackage) {
        String packageName = getResourcesPackage(Optional.of(subpackage.getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, getClientName(subpackage.getFernFilepath()));
    }

    public ClassName getWebSocketClientClassName(WebSocketChannel websocketChannel, Optional<Subpackage> subpackage) {
        // If subpackage is provided, generate path including subpackage name
        if (subpackage.isPresent()) {
            FernFilepath fernFilepath = subpackage.get().getFernFilepath();
            // Build the package path: resources.<subpackage>.websocket
            String resourcesPackage = getResourcesPackage(Optional.of(fernFilepath), Optional.empty());
            String websocketPackage = resourcesPackage + ".websocket";
            return ClassName.get(
                    websocketPackage,
                    websocketChannel.getName().get().getPascalCase().getSafeName() + "WebSocketClient");
        } else {
            // For root package, just use websocket subpackage
            String packageName = getResourcesPackage(Optional.empty(), Optional.of("websocket"));
            return ClassName.get(
                    packageName,
                    websocketChannel.getName().get().getPascalCase().getSafeName() + "WebSocketClient");
        }
    }

    public ClassName getRequestWrapperBodyClassName(HttpService httpService, SdkRequestWrapper sdkRequestWrapper) {
        String packageName;
        switch (packageLayout) {
            case FLAT:
                packageName = getTypesPackageName(httpService.getName().getFernFilepath());
                break;
            case NESTED:
            default:
                packageName = getResourcesPackage(
                        Optional.of(httpService.getName().getFernFilepath()), Optional.of("requests"));
        }
        return ClassName.get(
                packageName, sdkRequestWrapper.getWrapperName().getPascalCase().getSafeName());
    }

    public ClassName getApiErrorClassName(String organization, String workspaceName, JavaSdkCustomConfig customConfig) {
        String name = customConfig
                .baseApiExceptionClassName()
                .orElseGet(() ->
                        customConfig.clientClassName().orElseGet(() -> getBaseNamePrefix(organization, workspaceName))
                                + "ApiException");
        return getCoreClassName(name);
    }

    public ClassName getBaseExceptionClassName(
            String organization, String workspaceName, JavaSdkCustomConfig customConfig) {
        String name = customConfig
                .baseExceptionClassName()
                .orElseGet(() ->
                        customConfig.clientClassName().orElseGet(() -> getBaseNamePrefix(organization, workspaceName))
                                + "Exception");
        return getCoreClassName(name);
    }

    public ClassName getHttpResponseClassName(
            String organization, String workspaceName, JavaSdkCustomConfig customConfig) {
        String name = customConfig.clientClassName().orElseGet(() -> getBaseNamePrefix(organization, workspaceName))
                + "HttpResponse";
        return getCoreClassName(name);
    }

    public static String getBaseNamePrefix(String organization, String workspaceName) {
        return CasingUtils.convertKebabCaseToUpperCamelCase(organization)
                + CasingUtils.convertKebabCaseToUpperCamelCase(workspaceName);
    }

    private static String getClientName(FernFilepath fernFilepath) {
        return fernFilepath
                        .getAllParts()
                        .get(fernFilepath.getAllParts().size() - 1)
                        .getPascalCase()
                        .getUnsafeName() + "Client";
    }
}
