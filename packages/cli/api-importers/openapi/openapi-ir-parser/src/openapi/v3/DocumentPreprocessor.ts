import { Logger } from "@fern-api/logger";
import { OpenAPIV3 } from "openapi-types";
import path from "path";
import { ExternalDocumentResolver } from "./ExternalDocumentResolver";

/**
 * Preprocesses OpenAPI documents to resolve all external references
 * by fetching external components and adding them to the document's
 * /components section.
 */
export class DocumentPreprocessor {
    private readonly resolver: ExternalDocumentResolver;
    private readonly logger: Logger;
    private seenReferences = new Set<string>(); // Track processed references
    private pendingReferences = new Set<string>(); // References we need to process

    constructor(resolver: ExternalDocumentResolver, logger: Logger, sourceFile?: string) {
        this.resolver = resolver;
        this.logger = logger;
    }

    /**
     * 1. Find all external references in the document
     * 2. For each external reference, fetch it and add components to /components
     * 3. Iteratively process new references found in fetched components
     * 4. Continue until all references are resolved
     */
    public async processDocument(document: OpenAPIV3.Document, baseUrl?: string): Promise<OpenAPIV3.Document> {
        // Reset state
        this.seenReferences.clear();
        this.pendingReferences.clear();

        // Ensure we have a valid base URL
        const resolvedBaseUrl: string = baseUrl || "";

        try {
            // Ensure document has components section
            if (!document.components) {
                document.components = {};
            }

            // Step 1: Find all external references in the document
            this.collectExternalReferences(document);

            const totalRefsFound = this.pendingReferences.size;
            this.logger.debug(`Found ${totalRefsFound} external references to resolve`);

            // Step 2 & 3: DFS resolution - process references until none are pending
            while (this.pendingReferences.size > 0) {
                const currentRef = this.pendingReferences.values().next().value;
                if (currentRef) {
                    await this.resolveReference(currentRef, resolvedBaseUrl, document);
                }
            }

            this.logger.debug(
                `Document preprocessing completed. Resolved ${this.seenReferences.size} external references.`
            );
            return document;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Collect all external references in a document (DFS traversal)
     */
    private collectExternalReferences(value: any): void {
        if (value === null || value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => this.collectExternalReferences(item));
            return;
        }

        if (typeof value === "object") {
            // Check if this is a reference object
            if (value.$ref && typeof value.$ref === "string" && !value.$ref.startsWith("#")) {
                this.pendingReferences.add(value.$ref);
            }

            // Recursively process all properties
            Object.values(value).forEach((val) => this.collectExternalReferences(val));
        }
    }

    /**
     * Resolve a single external reference and add its components to the document
     */
    private async resolveReference(ref: string, baseUrl: string, document: OpenAPIV3.Document): Promise<void> {
        // Mark this reference as being processed
        this.pendingReferences.delete(ref);
        this.seenReferences.add(ref);

        try {
            this.logger.debug(`Resolving external reference: ${ref}`);

            const refInfo = this.resolver.parseReference(ref, baseUrl);

            const externalDoc = await this.resolver.getDocument(refInfo.documentUrl);

            if (refInfo.internalPointer === "#") {
                this.logger.debug(`Full document reference: ${ref} - importing all components`);
                if (externalDoc.components) {
                    this.mergeComponents(document, externalDoc.components);
                    this.collectExternalReferences(externalDoc.components);
                }
            } else {
                this.logger.debug(`Specific element reference: ${ref} - importing specific component`);
                try {
                    const resolvedComponent = await this.resolver.resolveReference(ref, baseUrl);
                    this.addSpecificComponent(document, refInfo.internalPointer, resolvedComponent);
                    this.collectExternalReferences(resolvedComponent);
                } catch (error) {
                    this.logger.warn(
                        `External reference ${ref} points to non-existent component: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            }
        } catch (error) {
            this.logger.warn(
                `Failed to resolve external reference ${ref}: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Add a specific component to the main document's /components section
     */
    private addSpecificComponent(mainDocument: OpenAPIV3.Document, internalPointer: string, component: any): void {
        if (!mainDocument.components) {
            mainDocument.components = {};
        }

        // Parse the internal pointer to determine component type and name
        // e.g., "#/components/schemas/Pet" -> componentType: "schemas", name: "Pet"
        if (!internalPointer.startsWith("#/components/")) {
            this.logger.warn(`Cannot add component with non-standard pointer: ${internalPointer}`);
            return;
        }

        const pathParts = internalPointer.substring(2).split("/"); // Remove "#/" and split
        if (pathParts.length < 3 || !pathParts[1] || !pathParts[2]) {
            this.logger.warn(`Invalid component pointer format: ${internalPointer}`);
            return;
        }

        const componentType = pathParts[1] as keyof OpenAPIV3.ComponentsObject;
        const componentName = pathParts[2];

        if (!mainDocument.components[componentType]) {
            mainDocument.components[componentType] = {};
        }

        // Add the component if it doesn't already exist
        const componentSection = mainDocument.components[componentType] as Record<string, any>;
        if (!componentSection[componentName]) {
            componentSection[componentName] = component;
            this.logger.debug(`Added specific component ${componentType}.${componentName} from external reference`);
        }
    }

    /**
     * Merge components from external document into main document
     */
    private mergeComponents(mainDocument: OpenAPIV3.Document, externalComponents: OpenAPIV3.ComponentsObject): void {
        if (!mainDocument.components) {
            mainDocument.components = {};
        }

        // Merge each component type
        const componentTypes = [
            "schemas",
            "responses",
            "parameters",
            "examples",
            "requestBodies",
            "headers",
            "securitySchemes",
            "links",
            "callbacks"
        ] as const;

        for (const componentType of componentTypes) {
            if (externalComponents[componentType]) {
                if (!mainDocument.components[componentType]) {
                    mainDocument.components[componentType] = {};
                }

                Object.entries(externalComponents[componentType]!).forEach(([name, component]) => {
                    if (!mainDocument.components![componentType]![name]) {
                        mainDocument.components![componentType]![name] = component;
                        this.logger.debug(`Added ${componentType}.${name} from external reference`);
                    }
                });
            }
        }
    }

    /**
     * Collect all external references in a document (static utility method)
     */
    public static collectExternalReferences(document: OpenAPIV3.Document): string[] {
        const refs = new Set<string>();

        const collectRefs = (value: any): void => {
            if (value === null || value === undefined) {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach(collectRefs);
                return;
            }

            if (typeof value === "object") {
                if (value.$ref && typeof value.$ref === "string" && !value.$ref.startsWith("#")) {
                    refs.add(value.$ref);
                }

                Object.values(value).forEach(collectRefs);
            }
        };

        collectRefs(document);
        return Array.from(refs);
    }

    /**
     * Check if a document has any external references
     */
    public static hasExternalReferences(document: OpenAPIV3.Document): boolean {
        return DocumentPreprocessor.collectExternalReferences(document).length > 0;
    }
}
