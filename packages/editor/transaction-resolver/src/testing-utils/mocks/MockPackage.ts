import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { generatePackageId } from "../ids";
import { Mock } from "./Mock";
import { MockEndpoint } from "./MockEndpoint";
import { MockError } from "./MockError";
import { MockType } from "./MockType";

export class MockPackage extends Mock implements FernApiEditor.Package {
    public packageId: string;
    public packageName: string;
    public endpoints: FernApiEditor.Endpoint[] = [];
    public types: FernApiEditor.Type[] = [];
    public errors: FernApiEditor.Error[] = [];

    constructor(name = "Mock Package") {
        super();
        this.packageId = generatePackageId();
        this.packageName = name;
    }

    public addEndpoint(name?: string): MockEndpoint {
        const endpoint = new MockEndpoint(name);
        this.endpoints.push(endpoint);
        return endpoint;
    }

    public addType(name?: string): MockType {
        const type = new MockType(name);
        this.types.push(type);
        return type;
    }

    public addError(name?: string): MockError {
        const error = new MockError(name);
        this.errors.push(error);
        return error;
    }
}
