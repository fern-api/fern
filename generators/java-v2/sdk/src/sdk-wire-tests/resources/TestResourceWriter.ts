import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

interface ResourceFile {
    resourcePath: string;
    content: string;
}

const TEST_RESOURCES_TEMPLATE = `package {{PACKAGE_NAME}};

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class {{CLASS_NAME}} {

    private {{CLASS_NAME}}() {
        // Utility class
    }

    /**
     * Loads a resource file from the classpath and returns its contents as a String.
     * @param path the resource path (e.g., "/wire-tests/MyTest_testMethod_request.json")
     * @return the contents of the resource file
     * @throws RuntimeException if the resource cannot be found or read
     */
    public static String loadResource(String path) {
        try (InputStream is = {{CLASS_NAME}}.class.getResourceAsStream(path)) {
            if (is == null) {
                throw new RuntimeException("Resource not found: " + path);
            }
            ByteArrayOutputStream result = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int length;
            while ((length = is.read(buffer)) != -1) {
                result.write(buffer, 0, length);
            }
            return result.toString(StandardCharsets.UTF_8.name());
        } catch (IOException e) {
            throw new RuntimeException("Failed to load resource: " + path, e);
        }
    }
}
`;

/**
 * Manages test resource files for large JSON payloads.
 * Instead of embedding large JSON strings inline (which can cause stack overflow
 * in code formatters due to deeply nested binary expressions), this writer
 * stores JSON in resource files and generates a utility class to load them.
 */
export class TestResourceWriter {
    private readonly resourceFiles: Map<string, ResourceFile> = new Map();
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    /**
     * Registers a JSON payload to be written as a resource file.
     * Returns the resource path that can be used to load the file at runtime.
     */
    public registerResource(testClassName: string, testMethodName: string, context: string, jsonData: unknown): string {
        const json = JSON.stringify(jsonData, null, 2);
        const sanitizedClassName = this.sanitizeForPath(testClassName);
        const sanitizedMethodName = this.sanitizeForPath(testMethodName);
        const resourceFileName = `${sanitizedClassName}_${sanitizedMethodName}_${context}.json`;
        const resourcePath = `/wire-tests/${resourceFileName}`;

        this.resourceFiles.set(resourcePath, {
            resourcePath,
            content: json
        });

        return resourcePath;
    }

    /**
     * Returns true if there are any registered resource files.
     */
    public hasResources(): boolean {
        return this.resourceFiles.size > 0;
    }

    /**
     * Generates the TestResources.java utility class for loading resource files.
     * Uses Java 8 compatible resource loading (no text blocks).
     */
    public generateTestResourcesClass(): File {
        const packageName = this.context.getRootPackageName();
        const className = "TestResources";

        const content = TEST_RESOURCES_TEMPLATE.replace(/\{\{PACKAGE_NAME\}\}/g, packageName).replace(
            /\{\{CLASS_NAME\}\}/g,
            className
        );

        const packagePath = packageName.replace(/\./g, "/");
        const filePath = `src/test/java/${packagePath}`;

        return new File(`${className}.java`, RelativeFilePath.of(filePath), content);
    }

    /**
     * Returns all registered resource files to be written.
     */
    public getResourceFiles(): File[] {
        const files: File[] = [];

        for (const [, resource] of this.resourceFiles) {
            const fileName = resource.resourcePath.split("/").pop() ?? "resource.json";
            files.push(new File(fileName, RelativeFilePath.of("src/test/resources/wire-tests"), resource.content));
        }

        return files;
    }

    /**
     * Clears all registered resources.
     */
    public clear(): void {
        this.resourceFiles.clear();
    }

    /**
     * Sanitizes a string for use in a file path.
     */
    private sanitizeForPath(value: string): string {
        return value.replace(/[^a-zA-Z0-9_]/g, "_");
    }
}
