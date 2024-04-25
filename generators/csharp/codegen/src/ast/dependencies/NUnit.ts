import { ClassReference } from "../";

const NUNIT_FRAMEWORK_NAMESPACE = "NUnit.Framework";

export const TestFixture: ClassReference = new ClassReference({
    name: "TestFixture",
    namespace: NUNIT_FRAMEWORK_NAMESPACE
});
