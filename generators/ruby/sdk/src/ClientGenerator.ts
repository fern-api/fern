import { GeneratorContext } from "@fern-api/generator-commons";
import { GeneratedRubyFile } from "@fern-api/ruby-codegen";
import { IntermediateRepresentation, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";

// TODO: This (as an abstract class) will probably be used across CLIs
export class ClientsGenerator {
    private types: Map<TypeId, TypeDeclaration>;
    private gc: GeneratorContext;

    constructor(generatorContext: GeneratorContext, intermediateRepresentation: IntermediateRepresentation) {
        this.types = new Map();
        this.gc = generatorContext;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`[TESTING] Found this many types: ${intermediateRepresentation.types.length}`);
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }
    }

    public generateFiles(): GeneratedRubyFile[] {
        // 1. Generate main file, this is what people import while leveraging the gem.

        // 2. Generate package-level files, this exists just to get dot-access functional.
        // These classes just hold instance variables of instantiated service clients.

        // 3. Generate service files, these are the classes that query the endpoints
        // and do the heavy lifting for API calls. While we iterate over endpoints here,
        // we should also generate an Example object, with a client and a function invocation (takes in an IR example).

        // TODO: Consider making Class_ + ClassReference and Function_ + Function invocation
        // follow a data model thats: ObjectDefinition, ObjectReference, ObjectInvocation(.withExample)

        return [];
    }
}
