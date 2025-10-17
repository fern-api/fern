import { Logger } from "@fern-api/logger";
import { OpenAPIV3 } from "openapi-types";
import { ExternalDocumentResolver } from "./ExternalDocumentResolver";

// Type for any value that might contain a $ref property
type OpenAPIValue =
    | OpenAPIV3.Document
    | OpenAPIV3.ComponentsObject
    | OpenAPIV3.SchemaObject
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.ResponseObject
    | OpenAPIV3.ParameterObject
    | OpenAPIV3.RequestBodyObject
    | OpenAPIV3.HeaderObject
    | OpenAPIV3.SecuritySchemeObject
    | OpenAPIV3.LinkObject
    | OpenAPIV3.CallbackObject
    | OpenAPIV3.ExampleObject
    | OpenAPIV3.PathItemObject
    | OpenAPIV3.OperationObject
    | OpenAPIV3.MediaTypeObject
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<OpenAPIValue>
    | Record<string, OpenAPIValue>;

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
     * 5. Replace all external references with internal references
     */
    public async processDocument(document: OpenAPIV3.Document, baseUrl?: string): Promise<OpenAPIV3.Document> {
        // Reset state
        this.seenReferences.clear();
        this.pendingReferences.clear();

        // Ensure we have a valid base URL
        const resolvedBaseUrl: string = baseUrl || "";

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

        // Step 4: Replace all external references with internal references
        this.replaceExternalReferences(document, resolvedBaseUrl);

        this.logger.debug(
            `Document preprocessing completed. Resolved ${this.seenReferences.size} external references.`
        );
        return document;
    }

    /**
     * Collect all external references in a document (DFS traversal)
     */
    private collectExternalReferences(value: OpenAPIValue): void {
        if (value === null || value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => this.collectExternalReferences(item));
            return;
        }

        if (typeof value === "object") {
            // Check if this is a reference object
            if (value && "$ref" in value && typeof value.$ref === "string" && !value.$ref.startsWith("#")) {
                this.pendingReferences.add(value.$ref);
            }

            // Recursively process all properties
            if (value) {
                Object.values(value).forEach((val) => this.collectExternalReferences(val));
            }
        }
    }

    /**
     * Resolve a single external reference and add its components to the document
     */
    private async resolveReference(ref: string, baseUrl: string, document: OpenAPIV3.Document): Promise<void> {
        // Mark this reference as being processed
        this.pendingReferences.delete(ref);

        try {
            this.logger.debug(`Resolving external reference: ${ref}`);

            const refInfo = this.resolver.parseReference(ref, baseUrl);

            const externalDoc = await this.resolver.getDocument(refInfo.documentUrl);

            if (refInfo.internalPointer === "#") {
                this.logger.debug(`Full document reference: ${ref} - importing all components`);
                if (externalDoc.components) {
                    this.mergeComponents(document, externalDoc.components);
                    this.collectExternalReferences(externalDoc.components);
                    // Only mark as successfully resolved if we successfully imported components
                    this.seenReferences.add(ref);
                }
            } else {
                this.logger.debug(`Specific element reference: ${ref} - importing specific component`);
                try {
                    const resolvedComponent = await this.resolver.resolveReference(ref, baseUrl);
                    this.addSpecificComponent(document, refInfo.internalPointer, resolvedComponent);
                    this.collectExternalReferences(resolvedComponent);
                    // Only mark as successfully resolved if we successfully imported the component
                    this.seenReferences.add(ref);
                } catch (error) {
                    this.logger.warn(
                        `External reference ${ref} points to non-existent component: ${error instanceof Error ? error.message : String(error)}`
                    );
                    // Don't add to seenReferences - leave the external reference as-is
                }
            }
        } catch (error) {
            this.logger.warn(
                `Failed to resolve external reference ${ref}: ${error instanceof Error ? error.message : String(error)}`
            );
            // Don't add to seenReferences - leave the external reference as-is
        }
    }

    /**
     * Add a specific component to the main document's /components section
     */
    private addSpecificComponent(
        mainDocument: OpenAPIV3.Document,
        internalPointer: string,
        component: OpenAPIValue
    ): void {
        if (!mainDocument.components) {
            mainDocument.components = {};
        }

        if (!mainDocument.components.schemas) {
            mainDocument.components.schemas = {};
        }

        let componentType: keyof OpenAPIV3.ComponentsObject = "schemas";
        let componentName: string;

        // Parse the internal pointer to determine component type and name
        if (internalPointer.startsWith("#/components/")) {
            // e.g., "#/components/schemas/Pet" -> componentType: "schemas", name: "Pet"
            const pathParts = internalPointer.substring(2).split("/"); // Remove "#/" and split
            if (pathParts.length < 3 || !pathParts[1] || !pathParts[2]) {
                this.logger.warn(`Invalid component pointer format: ${internalPointer}`);
                return;
            }
            componentType = pathParts[1] as keyof OpenAPIV3.ComponentsObject;
            componentName = pathParts[2];
        } else if (internalPointer.startsWith("#/")) {
            // e.g., "#/Pet" -> componentType: "schemas", name: "Pet" (default to schemas)
            componentName = internalPointer.substring(2); // Remove "#/"
            if (!componentName) {
                this.logger.warn(`Invalid simple component pointer format: ${internalPointer}`);
                return;
            }
        } else {
            this.logger.warn(`Cannot add component with invalid pointer: ${internalPointer}`);
            return;
        }

        if (!mainDocument.components[componentType]) {
            mainDocument.components[componentType] = {};
        }

        // Always add/overwrite the component (this ensures we store the actual content, not a reference)
        const componentSection = mainDocument.components[componentType] as Record<string, OpenAPIValue>;
        componentSection[componentName] = component;
        this.logger.debug(`Added specific component ${componentType}.${componentName} from external reference`);
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

                const externalComponentSection = externalComponents[componentType];
                const mainComponentSection = mainDocument.components?.[componentType];
                if (externalComponentSection && mainComponentSection) {
                    Object.entries(externalComponentSection).forEach(([name, component]) => {
                        const componentSection = mainComponentSection as Record<string, OpenAPIValue>;
                        if (!componentSection[name]) {
                            componentSection[name] = component;
                            this.logger.debug(`Added ${componentType}.${name} from external reference`);
                        }
                    });
                }
            }
        }
    }

    /**
     * Collect all external references in a document (static utility method)
     */
    public static collectExternalReferences(document: OpenAPIV3.Document): string[] {
        const refs = new Set<string>();

        const collectRefs = (value: OpenAPIValue): void => {
            if (value === null || value === undefined) {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach(collectRefs);
                return;
            }

            if (typeof value === "object") {
                if (value && "$ref" in value && typeof value.$ref === "string" && !value.$ref.startsWith("#")) {
                    refs.add(value.$ref);
                }

                if (value) {
                    Object.values(value).forEach(collectRefs);
                }
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

    /**
     * Replace all external references in the document with internal references
     * after components have been added to /components
     */
    private replaceExternalReferences(document: OpenAPIV3.Document, baseUrl: string): void {
        this.replaceExternalReferencesInValue(document, baseUrl);
    }

    /**
     * Recursively replace external references with internal references in any OpenAPI value
     */
    private replaceExternalReferencesInValue(value: OpenAPIValue, baseUrl: string): void {
        if (value === null || value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => this.replaceExternalReferencesInValue(item, baseUrl));
            return;
        }

        if (typeof value === "object") {
            // Check if this is a reference object with external reference
            if (value && "$ref" in value && typeof value.$ref === "string" && !value.$ref.startsWith("#")) {
                const externalRef = value.$ref;
                try {
                    const refInfo = this.resolver.parseReference(externalRef, baseUrl);

                    // Only replace if we successfully resolved this reference (it's in our seenReferences)
                    if (this.seenReferences.has(externalRef)) {
                        // Convert external reference to internal reference
                        const internalRef = this.convertToInternalReference(refInfo.internalPointer);
                        if (internalRef) {
                            value.$ref = internalRef;
                            this.logger.debug(`Replaced external reference ${externalRef} with ${internalRef}`);
                        }
                    }
                } catch (error) {
                    // If we can't parse the reference, leave it as-is
                    this.logger.debug(`Could not parse reference for replacement: ${externalRef}`);
                }
            }

            // Recursively process all properties
            if (value) {
                Object.values(value).forEach((val) => this.replaceExternalReferencesInValue(val, baseUrl));
            }
        }
    }

    /**
     * Convert an external reference's internal pointer to a proper internal reference
     * e.g., "#/Pet" -> "#/components/schemas/Pet"
     * e.g., "#/components/schemas/Pet" -> "#/components/schemas/Pet" (already correct)
     */
    private convertToInternalReference(internalPointer: string): string | null {
        if (!internalPointer.startsWith("#/")) {
            return null;
        }

        // If it's already a proper components reference, return as-is
        if (internalPointer.startsWith("#/components/")) {
            return internalPointer;
        }

        // Convert simple references like "#/Pet" to "#/components/schemas/Pet"
        const path = internalPointer.substring(2); // Remove "#/"
        if (path) {
            return `#/components/schemas/${path}`;
        }

        return null;
    }
}
