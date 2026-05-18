const { build } = require("esbuild");

void main();

async function main() {
    await bundle({
        platform: "node",
        target: "node14",
        format: "cjs",
        outdir: "node",
    });
    await bundle({
        platform: "browser",
        format: "esm",
        outdir: "browser/esm",
    });
    await bundle({
        platform: "browser",
        format: "cjs",
        outdir: "browser/cjs",
    });
}

async function bundle({ platform, target, format, outdir }) {
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/index.ts",
        outfile: `./dist/${outdir}/index.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/acceptHeader/index.ts",
        outfile: `./dist/${outdir}/api/resources/acceptHeader.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/acceptHeader/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/acceptHeader/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/alias/index.ts",
        outfile: `./dist/${outdir}/api/resources/alias.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/alias/resources/alias/index.ts",
        outfile: `./dist/${outdir}/api/resources/alias/resources/alias.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/aliasExtends/index.ts",
        outfile: `./dist/${outdir}/api/resources/aliasExtends.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/aliasExtends/resources/aliasExtends/index.ts",
        outfile: `./dist/${outdir}/api/resources/aliasExtends/resources/aliasExtends.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/allof/index.ts",
        outfile: `./dist/${outdir}/api/resources/allof.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/anyAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/anyAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/anyAuth/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/anyAuth/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/anyAuth/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/anyAuth/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/apiWideBasePath/index.ts",
        outfile: `./dist/${outdir}/api/resources/apiWideBasePath.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/apiWideBasePath/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/apiWideBasePath/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/audiences/index.ts",
        outfile: `./dist/${outdir}/api/resources/audiences.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/audiences/resources/foo/index.ts",
        outfile: `./dist/${outdir}/api/resources/audiences/resources/foo.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/audiences/resources/folderA/index.ts",
        outfile: `./dist/${outdir}/api/resources/audiences/resources/folderA.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/audiences/resources/folderA/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/audiences/resources/folderA/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/audiences/resources/folderD/index.ts",
        outfile: `./dist/${outdir}/api/resources/audiences/resources/folderD.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/audiences/resources/folderD/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/audiences/resources/folderD/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/basicAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/basicAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/basicAuth/resources/basicAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/basicAuth/resources/basicAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/basicAuthEnvironmentVariables/index.ts",
        outfile: `./dist/${outdir}/api/resources/basicAuthEnvironmentVariables.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/basicAuthEnvironmentVariables/resources/basicAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/basicAuthEnvironmentVariables/resources/basicAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/basicAuthPwOmitted/index.ts",
        outfile: `./dist/${outdir}/api/resources/basicAuthPwOmitted.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/basicAuthPwOmitted/resources/basicAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/basicAuthPwOmitted/resources/basicAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/bearerTokenEnvironmentVariable/index.ts",
        outfile: `./dist/${outdir}/api/resources/bearerTokenEnvironmentVariable.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/bearerTokenEnvironmentVariable/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/bearerTokenEnvironmentVariable/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/bytesDownload/index.ts",
        outfile: `./dist/${outdir}/api/resources/bytesDownload.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/bytesDownload/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/bytesDownload/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/bytesUpload/index.ts",
        outfile: `./dist/${outdir}/api/resources/bytesUpload.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/bytesUpload/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/bytesUpload/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/clientSideParams/index.ts",
        outfile: `./dist/${outdir}/api/resources/clientSideParams.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/clientSideParams/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/clientSideParams/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/contentType/index.ts",
        outfile: `./dist/${outdir}/api/resources/contentType.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/contentType/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/contentType/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/crossPackageTypeNames/index.ts",
        outfile: `./dist/${outdir}/api/resources/crossPackageTypeNames.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/crossPackageTypeNames/resources/foo/index.ts",
        outfile: `./dist/${outdir}/api/resources/crossPackageTypeNames/resources/foo.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/crossPackageTypeNames/resources/folderA/index.ts",
        outfile: `./dist/${outdir}/api/resources/crossPackageTypeNames/resources/folderA.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/crossPackageTypeNames/resources/folderA/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/crossPackageTypeNames/resources/folderA/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/crossPackageTypeNames/resources/folderD/index.ts",
        outfile: `./dist/${outdir}/api/resources/crossPackageTypeNames/resources/folderD.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/crossPackageTypeNames/resources/folderD/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/crossPackageTypeNames/resources/folderD/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpInlineTypes/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpInlineTypes.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpInlineTypes/resources/csharpInlineTypes/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpInlineTypes/resources/csharpInlineTypes.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpPropertyNameCollision/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpPropertyNameCollision.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpPropertyNameCollision/resources/csharpPropertyNameCollision/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpPropertyNameCollision/resources/csharpPropertyNameCollision.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpReadonlyRequest/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpReadonlyRequest.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpReadonlyRequest/resources/csharpReadonlyRequest/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpReadonlyRequest/resources/csharpReadonlyRequest.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpSystemCollision/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpSystemCollision.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpSystemCollision/resources/csharpSystemCollision/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpSystemCollision/resources/csharpSystemCollision.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpXmlEntities/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpXmlEntities.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpXmlEntities/resources/csharpXmlEntities/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpXmlEntities/resources/csharpXmlEntities.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpNamespaceConflict/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpNamespaceConflict.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/csharpNamespaceConflict/resources/tasktest/index.ts",
        outfile: `./dist/${outdir}/api/resources/csharpNamespaceConflict/resources/tasktest.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/endpointSecurityAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/endpointSecurityAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/endpointSecurityAuth/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/endpointSecurityAuth/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/endpointSecurityAuth/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/endpointSecurityAuth/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/enum/index.ts",
        outfile: `./dist/${outdir}/api/resources/enum.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/enum/resources/headers/index.ts",
        outfile: `./dist/${outdir}/api/resources/enum/resources/headers.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/enum/resources/inlinedRequest/index.ts",
        outfile: `./dist/${outdir}/api/resources/enum/resources/inlinedRequest.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/enum/resources/multipartForm/index.ts",
        outfile: `./dist/${outdir}/api/resources/enum/resources/multipartForm.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/enum/resources/pathParam/index.ts",
        outfile: `./dist/${outdir}/api/resources/enum/resources/pathParam.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/enum/resources/queryParam/index.ts",
        outfile: `./dist/${outdir}/api/resources/enum/resources/queryParam.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/errorProperty/index.ts",
        outfile: `./dist/${outdir}/api/resources/errorProperty.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/errorProperty/resources/propertyBasedError/index.ts",
        outfile: `./dist/${outdir}/api/resources/errorProperty/resources/propertyBasedError.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/errors/index.ts",
        outfile: `./dist/${outdir}/api/resources/errors.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/errors/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/errors/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/examples/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/examples.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/file/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/file.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/file/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/file/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/file/resources/notification/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/file/resources/notification.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/file/resources/notification/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/file/resources/notification/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/health/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/health.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/examples/resources/health/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/examples/resources/health/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpointsHttpMethods/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpointsHttpMethods.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpointsUrLs/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpointsUrLs.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/inlinedRequests/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/inlinedRequests.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/noAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/noAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/noReqBody/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/noReqBody.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/reqWithHeaders/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/reqWithHeaders.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/container/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/container.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/contentType/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/contentType.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/enum/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/enum.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/object/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/object.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/pagination/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/pagination.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/params/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/params.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/primitive/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/primitive.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/put/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/put.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/exhaustive/resources/endpoints/resources/union/index.ts",
        outfile: `./dist/${outdir}/api/resources/exhaustive/resources/endpoints/resources/union.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/extends/index.ts",
        outfile: `./dist/${outdir}/api/resources/extends.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/extends/resources/extends/index.ts",
        outfile: `./dist/${outdir}/api/resources/extends/resources/extends.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/extraProperties/index.ts",
        outfile: `./dist/${outdir}/api/resources/extraProperties.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/extraProperties/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/extraProperties/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/fileDownload/index.ts",
        outfile: `./dist/${outdir}/api/resources/fileDownload.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/fileDownload/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/fileDownload/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/fileUpload/index.ts",
        outfile: `./dist/${outdir}/api/resources/fileUpload.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/fileUpload/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/fileUpload/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/folders/index.ts",
        outfile: `./dist/${outdir}/api/resources/folders.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/folders/resources/folders/index.ts",
        outfile: `./dist/${outdir}/api/resources/folders/resources/folders.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/folders/resources/aB/index.ts",
        outfile: `./dist/${outdir}/api/resources/folders/resources/aB.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/folders/resources/aC/index.ts",
        outfile: `./dist/${outdir}/api/resources/folders/resources/aC.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/folders/resources/folder/index.ts",
        outfile: `./dist/${outdir}/api/resources/folders/resources/folder.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/folders/resources/folder/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/folders/resources/folder/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goOptionalLiteralAlias/index.ts",
        outfile: `./dist/${outdir}/api/resources/goOptionalLiteralAlias.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goOptionalLiteralAlias/resources/goOptionalLiteralAlias/index.ts",
        outfile: `./dist/${outdir}/api/resources/goOptionalLiteralAlias/resources/goOptionalLiteralAlias.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goBytesRequest/index.ts",
        outfile: `./dist/${outdir}/api/resources/goBytesRequest.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goBytesRequest/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/goBytesRequest/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goContentType/index.ts",
        outfile: `./dist/${outdir}/api/resources/goContentType.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goContentType/resources/imdb/index.ts",
        outfile: `./dist/${outdir}/api/resources/goContentType/resources/imdb.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpointsHttpMethods/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpointsHttpMethods.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpointsUrLs/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpointsUrLs.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/inlinedRequests/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/inlinedRequests.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/noAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/noAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/noReqBody/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/noReqBody.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/reqWithHeaders/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/reqWithHeaders.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/container.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/contentType/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/contentType.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesA/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesA.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesB/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesB.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesC/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesC.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/enum/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/enum.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/object.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/pagination/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/pagination.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/params.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/put/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/put.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goDeterministicOrdering/resources/endpoints/resources/union/index.ts",
        outfile: `./dist/${outdir}/api/resources/goDeterministicOrdering/resources/endpoints/resources/union.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goUndiscriminatedUnionWireTests/index.ts",
        outfile: `./dist/${outdir}/api/resources/goUndiscriminatedUnionWireTests.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/goUndiscriminatedUnionWireTests/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/goUndiscriminatedUnionWireTests/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/httpHead/index.ts",
        outfile: `./dist/${outdir}/api/resources/httpHead.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/httpHead/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/httpHead/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/idempotencyHeaders/index.ts",
        outfile: `./dist/${outdir}/api/resources/idempotencyHeaders.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/idempotencyHeaders/resources/payment/index.ts",
        outfile: `./dist/${outdir}/api/resources/idempotencyHeaders/resources/payment.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/imdb/index.ts",
        outfile: `./dist/${outdir}/api/resources/imdb.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/imdb/resources/imdb/index.ts",
        outfile: `./dist/${outdir}/api/resources/imdb/resources/imdb.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthExplicit/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthExplicit.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthExplicit/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthExplicit/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthExplicit/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthExplicit/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthExplicit/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthExplicit/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthExplicit/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthExplicit/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicit/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicit.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicit/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicit/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicit/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicit/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicit/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicit/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicit/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicit/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitApiKey/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitApiKey.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitApiKey/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitApiKey/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitApiKey/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitApiKey/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitApiKey/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitApiKey/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitApiKey/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitApiKey/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitNoExpiry/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitNoExpiry.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitNoExpiry/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitNoExpiry/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitNoExpiry/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitNoExpiry/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitNoExpiry/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitNoExpiry/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitNoExpiry/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitNoExpiry/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitReference/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitReference.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitReference/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitReference/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitReference/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitReference/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitReference/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitReference/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/inferredAuthImplicitReference/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/inferredAuthImplicitReference/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaDefaultTimeout/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaDefaultTimeout.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaDefaultTimeout/resources/javaDefaultTimeout/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaDefaultTimeout/resources/javaDefaultTimeout.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaInlineTypes/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaInlineTypes.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaInlineTypes/resources/javaInlineTypes/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaInlineTypes/resources/javaInlineTypes.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaOptionalNullableQueryParams/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaOptionalNullableQueryParams.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/javaOptionalNullableQueryParams/resources/javaOptionalNullableQueryParams/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaOptionalNullableQueryParams/resources/javaOptionalNullableQueryParams.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaOptionalQueryParamsOverloads/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaOptionalQueryParamsOverloads.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/javaOptionalQueryParamsOverloads/resources/javaOptionalQueryParamsOverloads/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaOptionalQueryParamsOverloads/resources/javaOptionalQueryParamsOverloads.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaPathParamKeyConflict/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaPathParamKeyConflict.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaRequiredBodyOptionalHeaders/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaRequiredBodyOptionalHeaders.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaBuilderExtension/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaBuilderExtension.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaBuilderExtension/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaBuilderExtension/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaCustomPackagePrefix/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaCustomPackagePrefix.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaCustomPackagePrefix/resources/imdb/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaCustomPackagePrefix/resources/imdb.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaOutputDirectory/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaOutputDirectory.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaOutputDirectory/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaOutputDirectory/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaPaginationDeepCursorPath/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaPaginationDeepCursorPath.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaPaginationDeepCursorPath/resources/deepCursorPath/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaPaginationDeepCursorPath/resources/deepCursorPath.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaSinglePropertyEndpoint/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaSinglePropertyEndpoint.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaSinglePropertyEndpoint/resources/singleProperty/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaSinglePropertyEndpoint/resources/singleProperty.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaStagedBuilderOrdering/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaStagedBuilderOrdering.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaStagedBuilderOrdering/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaStagedBuilderOrdering/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaStreamingAcceptHeader/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaStreamingAcceptHeader.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/javaStreamingAcceptHeader/resources/dummy/index.ts",
        outfile: `./dist/${outdir}/api/resources/javaStreamingAcceptHeader/resources/dummy.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/license/index.ts",
        outfile: `./dist/${outdir}/api/resources/license.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/license/resources/license/index.ts",
        outfile: `./dist/${outdir}/api/resources/license/resources/license.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literal/index.ts",
        outfile: `./dist/${outdir}/api/resources/literal.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literal/resources/headers/index.ts",
        outfile: `./dist/${outdir}/api/resources/literal/resources/headers.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literal/resources/inlined/index.ts",
        outfile: `./dist/${outdir}/api/resources/literal/resources/inlined.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literal/resources/path/index.ts",
        outfile: `./dist/${outdir}/api/resources/literal/resources/path.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literal/resources/query/index.ts",
        outfile: `./dist/${outdir}/api/resources/literal/resources/query.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literal/resources/reference/index.ts",
        outfile: `./dist/${outdir}/api/resources/literal/resources/reference.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literalUserAgent/index.ts",
        outfile: `./dist/${outdir}/api/resources/literalUserAgent.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/literalUserAgent/resources/literalUserAgent/index.ts",
        outfile: `./dist/${outdir}/api/resources/literalUserAgent/resources/literalUserAgent.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/mixedCase/index.ts",
        outfile: `./dist/${outdir}/api/resources/mixedCase.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/mixedCase/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/mixedCase/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/mixedFileDirectory/index.ts",
        outfile: `./dist/${outdir}/api/resources/mixedFileDirectory.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/mixedFileDirectory/resources/organization/index.ts",
        outfile: `./dist/${outdir}/api/resources/mixedFileDirectory/resources/organization.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/mixedFileDirectory/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/mixedFileDirectory/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/mixedFileDirectory/resources/user/resources/events/index.ts",
        outfile: `./dist/${outdir}/api/resources/mixedFileDirectory/resources/user/resources/events.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/mixedFileDirectory/resources/user/resources/events/resources/metadata/index.ts",
        outfile: `./dist/${outdir}/api/resources/mixedFileDirectory/resources/user/resources/events/resources/metadata.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironmentReference/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironmentReference.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironmentReference/resources/items/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironmentReference/resources/items.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironmentReference/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironmentReference/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironmentReference/resources/files/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironmentReference/resources/files.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiLineDocs/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiLineDocs.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiLineDocs/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiLineDocs/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironment/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironment.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironment/resources/ec2/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironment/resources/ec2.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironment/resources/s3/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironment/resources/s3.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironmentNoDefault/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironmentNoDefault.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironmentNoDefault/resources/ec2/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironmentNoDefault/resources/ec2.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multiUrlEnvironmentNoDefault/resources/s3/index.ts",
        outfile: `./dist/${outdir}/api/resources/multiUrlEnvironmentNoDefault/resources/s3.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multipleRequestBodies/index.ts",
        outfile: `./dist/${outdir}/api/resources/multipleRequestBodies.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/multipleRequestBodies/resources/multipleRequestBodies/index.ts",
        outfile: `./dist/${outdir}/api/resources/multipleRequestBodies/resources/multipleRequestBodies.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/noContentResponse/index.ts",
        outfile: `./dist/${outdir}/api/resources/noContentResponse.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/noContentResponse/resources/contacts/index.ts",
        outfile: `./dist/${outdir}/api/resources/noContentResponse/resources/contacts.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/noEnvironment/index.ts",
        outfile: `./dist/${outdir}/api/resources/noEnvironment.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/noEnvironment/resources/dummy/index.ts",
        outfile: `./dist/${outdir}/api/resources/noEnvironment/resources/dummy.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/noRetries/index.ts",
        outfile: `./dist/${outdir}/api/resources/noRetries.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/noRetries/resources/retries/index.ts",
        outfile: `./dist/${outdir}/api/resources/noRetries/resources/retries.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullType/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullType.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullType/resources/conversations/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullType/resources/conversations.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullType/resources/users/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullType/resources/users.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullable/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullable.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullable/resources/nullable/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullable/resources/nullable.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullableAllofExtends/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullableAllofExtends.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullableOptional/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullableOptional.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullableOptional/resources/nullableOptional/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullableOptional/resources/nullableOptional.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullableRequestBody/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullableRequestBody.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/nullableRequestBody/resources/testGroup/index.ts",
        outfile: `./dist/${outdir}/api/resources/nullableRequestBody/resources/testGroup.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentials/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentials.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentials/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentials/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentials/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentials/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentials/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentials/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentials/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentials/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsCustom/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsCustom.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsCustom/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsCustom/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsCustom/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsCustom/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsCustom/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsCustom/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsCustom/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsCustom/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsDefault/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsDefault.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsDefault/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsDefault/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsDefault/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsDefault/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsDefault/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsDefault/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsDefault/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsDefault/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsEnvironmentVariables/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsEnvironmentVariables.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsEnvironmentVariables/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsEnvironmentVariables/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsEnvironmentVariables/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsEnvironmentVariables/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsMandatoryAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsMandatoryAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsMandatoryAuth/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsMandatoryAuth/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsMandatoryAuth/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsMandatoryAuth/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsMandatoryAuth/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsMandatoryAuth/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsNestedRoot/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsNestedRoot.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsNestedRoot/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsNestedRoot/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsNestedRoot/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsNestedRoot/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsNestedRoot/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsNestedRoot/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsNestedRoot/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsNestedRoot/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsOpenapi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsOpenapi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsOpenapi/resources/identity/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsOpenapi/resources/identity.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsOpenapi/resources/plants/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsOpenapi/resources/plants.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsReference/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsReference.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsReference/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsReference/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsReference/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsReference/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsWithVariables/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsWithVariables.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsWithVariables/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsWithVariables/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsWithVariables/resources/nestedNoAuthApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsWithVariables/resources/nestedNoAuthApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsWithVariables/resources/nestedApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsWithVariables/resources/nestedApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsWithVariables/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsWithVariables/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/oauthClientCredentialsWithVariables/resources/simple/index.ts",
        outfile: `./dist/${outdir}/api/resources/oauthClientCredentialsWithVariables/resources/simple.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/openapiRequestBodyRef/index.ts",
        outfile: `./dist/${outdir}/api/resources/openapiRequestBodyRef.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/openapiRequestBodyRef/resources/vendor/index.ts",
        outfile: `./dist/${outdir}/api/resources/openapiRequestBodyRef/resources/vendor.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/openapiRequestBodyRef/resources/catalog/index.ts",
        outfile: `./dist/${outdir}/api/resources/openapiRequestBodyRef/resources/catalog.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/openapiRequestBodyRef/resources/teamMember/index.ts",
        outfile: `./dist/${outdir}/api/resources/openapiRequestBodyRef/resources/teamMember.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/optional/index.ts",
        outfile: `./dist/${outdir}/api/resources/optional.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/optional/resources/optional/index.ts",
        outfile: `./dist/${outdir}/api/resources/optional/resources/optional.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pagination/index.ts",
        outfile: `./dist/${outdir}/api/resources/pagination.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pagination/resources/complex/index.ts",
        outfile: `./dist/${outdir}/api/resources/pagination/resources/complex.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pagination/resources/users/index.ts",
        outfile: `./dist/${outdir}/api/resources/pagination/resources/users.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pagination/resources/inlineUsers/index.ts",
        outfile: `./dist/${outdir}/api/resources/pagination/resources/inlineUsers.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/index.ts",
        outfile: `./dist/${outdir}/api/resources/pagination/resources/inlineUsers/resources/inlineUsers.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/paginationCustom/index.ts",
        outfile: `./dist/${outdir}/api/resources/paginationCustom.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/paginationCustom/resources/users/index.ts",
        outfile: `./dist/${outdir}/api/resources/paginationCustom/resources/users.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/paginationUriPath/index.ts",
        outfile: `./dist/${outdir}/api/resources/paginationUriPath.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/paginationUriPath/resources/users/index.ts",
        outfile: `./dist/${outdir}/api/resources/paginationUriPath/resources/users.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pathParameters/index.ts",
        outfile: `./dist/${outdir}/api/resources/pathParameters.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pathParameters/resources/organizations/index.ts",
        outfile: `./dist/${outdir}/api/resources/pathParameters/resources/organizations.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pathParameters/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/pathParameters/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/plainText/index.ts",
        outfile: `./dist/${outdir}/api/resources/plainText.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/plainText/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/plainText/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/propertyAccess/index.ts",
        outfile: `./dist/${outdir}/api/resources/propertyAccess.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/propertyAccess/resources/propertyAccess/index.ts",
        outfile: `./dist/${outdir}/api/resources/propertyAccess/resources/propertyAccess.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/publicObject/index.ts",
        outfile: `./dist/${outdir}/api/resources/publicObject.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/publicObject/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/publicObject/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pythonPositionalSingleProperty/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonPositionalSingleProperty.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/pythonPositionalSingleProperty/resources/pythonPositionalSingleProperty/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonPositionalSingleProperty/resources/pythonPositionalSingleProperty.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pythonBackslashEscape/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonBackslashEscape.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pythonBackslashEscape/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonBackslashEscape/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pythonReservedKeywordSubpackages/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonReservedKeywordSubpackages.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pythonReservedKeywordSubpackages/resources/class/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonReservedKeywordSubpackages/resources/class.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/pythonReservedKeywordSubpackages/resources/automations/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonReservedKeywordSubpackages/resources/automations.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/pythonReservedKeywordSubpackages/resources/automations/resources/import/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonReservedKeywordSubpackages/resources/automations/resources/import.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/pythonReservedKeywordSubpackages/resources/automations/resources/export/index.ts",
        outfile: `./dist/${outdir}/api/resources/pythonReservedKeywordSubpackages/resources/automations/resources/export.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/queryParametersOpenapi/index.ts",
        outfile: `./dist/${outdir}/api/resources/queryParametersOpenapi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/queryParameters/index.ts",
        outfile: `./dist/${outdir}/api/resources/queryParameters.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/queryParameters/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/queryParameters/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/requestParameters/index.ts",
        outfile: `./dist/${outdir}/api/resources/requestParameters.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/requestParameters/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/requestParameters/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/requiredNullable/index.ts",
        outfile: `./dist/${outdir}/api/resources/requiredNullable.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/requiredNullable/resources/requiredNullable/index.ts",
        outfile: `./dist/${outdir}/api/resources/requiredNullable/resources/requiredNullable.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/reservedKeywords/index.ts",
        outfile: `./dist/${outdir}/api/resources/reservedKeywords.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/reservedKeywords/resources/package/index.ts",
        outfile: `./dist/${outdir}/api/resources/reservedKeywords/resources/package.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/responseProperty/index.ts",
        outfile: `./dist/${outdir}/api/resources/responseProperty.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/responseProperty/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/responseProperty/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/rubyReservedWordProperties/index.ts",
        outfile: `./dist/${outdir}/api/resources/rubyReservedWordProperties.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/rubyReservedWordProperties/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/rubyReservedWordProperties/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/schemalessRequestBodyExamples/index.ts",
        outfile: `./dist/${outdir}/api/resources/schemalessRequestBodyExamples.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/serverUrlTemplating/index.ts",
        outfile: `./dist/${outdir}/api/resources/serverUrlTemplating.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/serverSentEventExamples/index.ts",
        outfile: `./dist/${outdir}/api/resources/serverSentEventExamples.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/serverSentEventExamples/resources/completions/index.ts",
        outfile: `./dist/${outdir}/api/resources/serverSentEventExamples/resources/completions.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/serverSentEvents/index.ts",
        outfile: `./dist/${outdir}/api/resources/serverSentEvents.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/serverSentEvents/resources/completions/index.ts",
        outfile: `./dist/${outdir}/api/resources/serverSentEvents/resources/completions.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/simpleFhir/index.ts",
        outfile: `./dist/${outdir}/api/resources/simpleFhir.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/simpleFhir/resources/simpleFhir/index.ts",
        outfile: `./dist/${outdir}/api/resources/simpleFhir/resources/simpleFhir.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/simpleApi/index.ts",
        outfile: `./dist/${outdir}/api/resources/simpleApi.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/simpleApi/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/simpleApi/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/singleUrlEnvironmentDefault/index.ts",
        outfile: `./dist/${outdir}/api/resources/singleUrlEnvironmentDefault.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/singleUrlEnvironmentDefault/resources/dummy/index.ts",
        outfile: `./dist/${outdir}/api/resources/singleUrlEnvironmentDefault/resources/dummy.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/singleUrlEnvironmentNoDefault/index.ts",
        outfile: `./dist/${outdir}/api/resources/singleUrlEnvironmentNoDefault.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/singleUrlEnvironmentNoDefault/resources/dummy/index.ts",
        outfile: `./dist/${outdir}/api/resources/singleUrlEnvironmentNoDefault/resources/dummy.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/streaming/index.ts",
        outfile: `./dist/${outdir}/api/resources/streaming.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/streaming/resources/dummy/index.ts",
        outfile: `./dist/${outdir}/api/resources/streaming/resources/dummy.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/streamingParameter/index.ts",
        outfile: `./dist/${outdir}/api/resources/streamingParameter.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/streamingParameter/resources/dummy/index.ts",
        outfile: `./dist/${outdir}/api/resources/streamingParameter/resources/dummy.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/v2/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/v2.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/admin/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/admin.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/homepage/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/homepage.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/migration/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/migration.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/playlist/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/playlist.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/problem/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/problem.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/submission/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/submission.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/sysprop/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/sysprop.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/v2/resources/problem/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/v2/resources/problem.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/v2/resources/v3/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/v2/resources/v3.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/trace/resources/v2/resources/v3/resources/problem/index.ts",
        outfile: `./dist/${outdir}/api/resources/trace/resources/v2/resources/v3/resources/problem.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/tsExtraProperties/index.ts",
        outfile: `./dist/${outdir}/api/resources/tsExtraProperties.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/tsInlineTypes/index.ts",
        outfile: `./dist/${outdir}/api/resources/tsInlineTypes.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/tsInlineTypes/resources/tsInlineTypes/index.ts",
        outfile: `./dist/${outdir}/api/resources/tsInlineTypes/resources/tsInlineTypes.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/tsExpressCasing/index.ts",
        outfile: `./dist/${outdir}/api/resources/tsExpressCasing.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/tsExpressCasing/resources/imdb/index.ts",
        outfile: `./dist/${outdir}/api/resources/tsExpressCasing/resources/imdb.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/undiscriminatedUnionWithResponseProperty/index.ts",
        outfile: `./dist/${outdir}/api/resources/undiscriminatedUnionWithResponseProperty.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint:
            "./src/api/resources/undiscriminatedUnionWithResponseProperty/resources/undiscriminatedUnionWithResponseProperty/index.ts",
        outfile: `./dist/${outdir}/api/resources/undiscriminatedUnionWithResponseProperty/resources/undiscriminatedUnionWithResponseProperty.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/undiscriminatedUnions/index.ts",
        outfile: `./dist/${outdir}/api/resources/undiscriminatedUnions.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/undiscriminatedUnions/resources/union/index.ts",
        outfile: `./dist/${outdir}/api/resources/undiscriminatedUnions/resources/union.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unionQueryParameters/index.ts",
        outfile: `./dist/${outdir}/api/resources/unionQueryParameters.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unionQueryParameters/resources/events/index.ts",
        outfile: `./dist/${outdir}/api/resources/unionQueryParameters/resources/events.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unions/index.ts",
        outfile: `./dist/${outdir}/api/resources/unions.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unions/resources/bigunion/index.ts",
        outfile: `./dist/${outdir}/api/resources/unions/resources/bigunion.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unions/resources/union/index.ts",
        outfile: `./dist/${outdir}/api/resources/unions/resources/union.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unionsWithLocalDate/index.ts",
        outfile: `./dist/${outdir}/api/resources/unionsWithLocalDate.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unionsWithLocalDate/resources/bigunion/index.ts",
        outfile: `./dist/${outdir}/api/resources/unionsWithLocalDate/resources/bigunion.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unionsWithLocalDate/resources/types/index.ts",
        outfile: `./dist/${outdir}/api/resources/unionsWithLocalDate/resources/types.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unionsWithLocalDate/resources/union/index.ts",
        outfile: `./dist/${outdir}/api/resources/unionsWithLocalDate/resources/union.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unknown/index.ts",
        outfile: `./dist/${outdir}/api/resources/unknown.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/unknown/resources/unknown/index.ts",
        outfile: `./dist/${outdir}/api/resources/unknown/resources/unknown.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/urlFormEncoded/index.ts",
        outfile: `./dist/${outdir}/api/resources/urlFormEncoded.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/validation/index.ts",
        outfile: `./dist/${outdir}/api/resources/validation.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/validation/resources/validation/index.ts",
        outfile: `./dist/${outdir}/api/resources/validation/resources/validation.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/variables/index.ts",
        outfile: `./dist/${outdir}/api/resources/variables.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/variables/resources/service/index.ts",
        outfile: `./dist/${outdir}/api/resources/variables/resources/service.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/version/index.ts",
        outfile: `./dist/${outdir}/api/resources/version.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/version/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/version/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/versionNoDefault/index.ts",
        outfile: `./dist/${outdir}/api/resources/versionNoDefault.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/versionNoDefault/resources/user/index.ts",
        outfile: `./dist/${outdir}/api/resources/versionNoDefault/resources/user.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/webhookAudience/index.ts",
        outfile: `./dist/${outdir}/api/resources/webhookAudience.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/websocketInferredAuth/index.ts",
        outfile: `./dist/${outdir}/api/resources/websocketInferredAuth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/websocketInferredAuth/resources/auth/index.ts",
        outfile: `./dist/${outdir}/api/resources/websocketInferredAuth/resources/auth.js`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./src/api/resources/xFernDefault/index.ts",
        outfile: `./dist/${outdir}/api/resources/xFernDefault.js`,
    });
}

async function runEsbuild({ platform, target, format, entryPoint, outfile }) {
    await build({
        platform,
        target,
        format,
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
    }).catch(() => process.exit(1));
}
