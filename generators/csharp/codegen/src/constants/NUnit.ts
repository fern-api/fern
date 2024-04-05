import { ClassReference } from "../ast";

const NUNIT_FRAMEWORK_NAMESPACE = "NUnit.Framework";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NUnit {
    public static TestFixture: ClassReference = new ClassReference({
        name: "TestFixture",
        namespace: NUNIT_FRAMEWORK_NAMESPACE
    });
}
