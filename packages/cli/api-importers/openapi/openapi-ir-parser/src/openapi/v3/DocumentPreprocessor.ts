import { Logger } from "@fern-api/logger";
import { OpenAPIV3 } from "openapi-types";
import { ExternalDocumentResolver, type OpenAPIValue } from "./ExternalDocumentResolver";

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

            // Check if this is a domain/shared components reference (like SwaggerHub domains)
            // These should import all components to ensure dependencies are available
            const isDomainReference = this.isDomainReference(refInfo.documentUrl);

            if (refInfo.internalPointer === "#" || isDomainReference) {
                this.logger.debug(
                    `${isDomainReference ? "Domain" : "Full document"} reference: ${ref} - importing all components`
                );
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
                        const existingComponent = componentSection[name];

                        // Always overwrite if the existing component is just a reference, or if it doesn't exist
                        // This prevents circular references when domain components overwrite local references
                        const existingIsReference =
                            existingComponent &&
                            typeof existingComponent === "object" &&
                            "$ref" in existingComponent &&
                            typeof existingComponent.$ref === "string";

                        if (!existingComponent || existingIsReference) {
                            componentSection[name] = component;
                            const action = !existingComponent ? "Added" : "Replaced reference";
                            this.logger.debug(`${action} ${componentType}.${name} from external reference`);
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

        // After replacing external references, check for and fix cross-reference mismatches
        this.fixCrossReferenceMismatches(document);
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

    /**
     * Fix cross-reference mismatches where a component is referenced as a different type
     * than where it was placed during external resolution.
     *
     * For example, if a parameter was imported to components.parameters but is
     * referenced as #/components/schemas/ComponentName elsewhere in the document.
     */
    private fixCrossReferenceMismatches(document: OpenAPIV3.Document): void {
        if (!document.components) {
            return;
        }

        // Collect all internal references in the document
        const allInternalRefs = new Set<string>();
        this.collectInternalReferences(document, allInternalRefs);

        // Get all available components for debugging
        const availableComponents = new Map<string, string[]>();
        for (const [sectionName, section] of Object.entries(document.components)) {
            if (section && typeof section === "object") {
                availableComponents.set(sectionName, Object.keys(section));
            }
        }

        this.logger.debug(
            `Available components by section: ${Array.from(availableComponents.entries())
                .map(([section, names]) => `${section}: [${names.join(", ")}]`)
                .join("; ")}`
        );

        // Check for mismatches and create missing components
        for (const ref of allInternalRefs) {
            if (!this.referenceExists(document, ref)) {
                this.logger.debug(`Missing reference detected: ${ref}`);
                this.tryFixMismatchedReference(document, ref);
            }
        }
    }

    /**
     * Collect all internal references (#/components/...) in the document
     */
    private collectInternalReferences(value: OpenAPIValue, refs: Set<string>): void {
        if (value === null || value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => this.collectInternalReferences(item, refs));
            return;
        }

        if (typeof value === "object") {
            if (value && "$ref" in value && typeof value.$ref === "string" && value.$ref.startsWith("#/components/")) {
                refs.add(value.$ref);
            }

            if (value) {
                Object.values(value).forEach((val) => this.collectInternalReferences(val, refs));
            }
        }
    }

    /**
     * Check if a reference exists in the document
     */
    private referenceExists(document: OpenAPIV3.Document, ref: string): boolean {
        if (!ref.startsWith("#/components/")) {
            return false;
        }

        const parts = ref.substring(13).split("/"); // Remove "#/components/"
        if (parts.length < 2 || !parts[0] || !parts[1]) {
            return false;
        }

        const componentType = parts[0];
        const componentName = parts[1];
        const componentSection = document.components?.[componentType as keyof OpenAPIV3.ComponentsObject];
        return componentSection != null && (componentSection as Record<string, unknown>)[componentName] != null;
    }

    /**
     * Try to fix a mismatched reference by looking for the component in other sections
     */
    private tryFixMismatchedReference(document: OpenAPIV3.Document, ref: string): void {
        if (!document.components) {
            return;
        }

        const parts = ref.substring(13).split("/"); // Remove "#/components/"
        if (parts.length < 2 || !parts[0] || !parts[1]) {
            return;
        }

        const targetType = parts[0];
        const componentName = parts[1];

        // First, try to find exact matches in other sections
        if (this.tryFindInOtherSections(document, ref, targetType, componentName)) {
            return;
        }

        // If no exact match, try name variations for common schema naming patterns
        if (targetType === "schemas") {
            this.tryNameVariations(document, ref, componentName);
        }
    }

    /**
     * Try to find component in other sections with exact name match
     */
    private tryFindInOtherSections(
        document: OpenAPIV3.Document,
        ref: string,
        targetType: string,
        componentName: string
    ): boolean {
        if (!document.components) {
            return false;
        }

        // Look for the component in other sections
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
        ];

        for (const sourceType of componentTypes) {
            if (sourceType === targetType) {
                continue; // Skip the target type
            }

            const sourceSection = document.components[sourceType as keyof OpenAPIV3.ComponentsObject];
            if (sourceSection && (sourceSection as Record<string, unknown>)[componentName]) {
                const sourceComponent = (sourceSection as Record<string, OpenAPIValue>)[componentName];

                // Try to adapt the component to the target type
                const adaptedComponent = this.adaptComponent(sourceComponent, sourceType, targetType, componentName);
                if (adaptedComponent) {
                    // Ensure target section exists
                    if (!document.components[targetType as keyof OpenAPIV3.ComponentsObject]) {
                        (document.components as Record<string, unknown>)[targetType] = {};
                    }

                    const targetSection = document.components[targetType as keyof OpenAPIV3.ComponentsObject] as Record<
                        string,
                        OpenAPIValue
                    >;
                    targetSection[componentName] = adaptedComponent;

                    this.logger.debug(
                        `Fixed cross-reference mismatch: copied ${componentName} from ${sourceType} to ${targetType}`
                    );
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Try name variations for common schema naming patterns
     */
    private tryNameVariations(document: OpenAPIV3.Document, originalRef: string, componentName: string): void {
        if (!document.components?.schemas) {
            return;
        }

        const schemas = document.components.schemas as Record<string, OpenAPIValue>;
        const availableSchemas = Object.keys(schemas);

        // Define common naming variations to try
        const variations = this.generateNameVariations(componentName);

        for (const variation of variations) {
            if (availableSchemas.includes(variation)) {
                // Found a matching variation, create an alias
                schemas[componentName] = schemas[variation];
                this.logger.debug(
                    `Fixed schema name variation: created alias ${componentName} -> ${variation} (available: ${availableSchemas.join(", ")})`
                );
                return;
            }
        }

        this.logger.warn(
            `Could not resolve schema reference ${originalRef}. Tried variations: ${variations.join(", ")}. Available: ${availableSchemas.join(", ")}`
        );
    }

    /**
     * Generate common naming variations for a schema name
     */
    private generateNameVariations(name: string): string[] {
        const variations: string[] = [];

        // Handle PagingCursorUrl -> PagingCursors pattern
        if (name === "PagingCursorUrl") {
            variations.push("PagingCursors", "PagingCursor", "Paging", "CursorUrl", "Cursors");
        }

        // Handle URL -> Url pattern
        if (name.endsWith("URL")) {
            variations.push(name.replace(/URL$/, "Url"));
        }
        if (name.endsWith("Url")) {
            variations.push(name.replace(/Url$/, "URL"));
        }

        // Handle plural/singular variations
        if (name.endsWith("s")) {
            variations.push(name.slice(0, -1)); // Remove 's'
        } else {
            variations.push(name + "s"); // Add 's'
        }

        // Handle common suffixes
        const commonSuffixes = ["Response", "Request", "Data", "Info", "Object", "Type", "Config", "Settings"];
        for (const suffix of commonSuffixes) {
            if (name.endsWith(suffix)) {
                variations.push(name.replace(new RegExp(`${suffix}$`), ""));
            } else {
                variations.push(name + suffix);
            }
        }

        return [...new Set(variations)]; // Remove duplicates
    }

    /**
     * Adapt a component from one type to another when possible
     */
    private adaptComponent(
        component: OpenAPIValue,
        sourceType: string,
        targetType: string,
        componentName: string
    ): OpenAPIValue | null {
        if (typeof component !== "object" || component === null) {
            return null;
        }

        // Parameter to Schema adaptation
        if (sourceType === "parameters" && targetType === "schemas") {
            const paramComponent = component as Record<string, OpenAPIValue>;
            if (paramComponent.schema) {
                this.logger.debug(`Adapting parameter ${componentName} to schema by extracting schema property`);

                // Check if the schema property itself is a reference to avoid circular references
                const schema = paramComponent.schema;
                if (typeof schema === "object" && schema && "$ref" in schema) {
                    const ref = schema.$ref as string;
                    if (ref === `#/components/schemas/${componentName}`) {
                        this.logger.warn(
                            `Circular reference detected: parameter ${componentName} has schema that references itself. Skipping adaptation.`
                        );
                        return null;
                    }
                }

                return paramComponent.schema;
            }
        }

        // Schema to Parameter adaptation (less common, but possible)
        if (sourceType === "schemas" && targetType === "parameters") {
            this.logger.debug(`Cannot adapt schema ${componentName} to parameter (would need parameter metadata)`);
            return null;
        }

        // For other types, attempt direct copy if structures are compatible
        // But check for potential circular references first
        if (typeof component === "object" && component && "$ref" in component) {
            const ref = component.$ref as string;
            if (ref === `#/components/${targetType}/${componentName}`) {
                this.logger.warn(
                    `Circular reference detected: component ${componentName} references itself. Skipping direct copy.`
                );
                return null;
            }
        }

        this.logger.debug(`Attempting direct copy of ${componentName} from ${sourceType} to ${targetType}`);
        return component;
    }

    /**
     * Check if a document URL represents a domain/shared components reference that should
     * import all components to ensure dependencies are available
     */
    private isDomainReference(documentUrl: string): boolean {
        // SwaggerHub domains - these are shared component libraries
        if (documentUrl.includes("api.swaggerhub.com/domains/")) {
            return true;
        }

        // Enterprise CDN models - shared component libraries hosted on CDNs
        if (documentUrl.includes("cdn.com/models/") || documentUrl.includes("assets.cdn.com/models/")) {
            return true;
        }

        // Add other domain patterns as needed
        // GitHub raw content for shared schemas
        if (documentUrl.includes("raw.githubusercontent.com") && documentUrl.includes("/schemas/")) {
            return true;
        }

        // Local test files that represent domain libraries
        // Match patterns like "collections-domain.yml", "domain.json", "shared-domain.yml", etc.
        const fileName = documentUrl.split(/[/\\]/).pop()?.toLowerCase() || "";
        if (fileName.includes("domain") || fileName.includes("collections") || fileName.includes("shared")) {
            return true;
        }

        return false;
    }
}
