import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { ApiId } from "@fern-fern/api-editor-sdk/resources";
import { v4 as uuidv4 } from "uuid";
import { Mock } from "./Mock";
import { MockPackage } from "./MockPackage";

export class MockApi extends Mock implements FernApiEditor.Api {
    public apiId: ApiId;
    public apiName: string;
    public packages: FernApiEditor.Package[] = [];

    constructor(name = "Mock API") {
        super();
        this.apiId = uuidv4();
        this.apiName = name;
    }

    public addPackage(name?: string): MockPackage {
        const package_ = new MockPackage(name);
        this.packages.push(package_);
        return package_;
    }
}
