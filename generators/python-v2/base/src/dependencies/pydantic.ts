import { python } from "@fern-api/python-ast";

export const BaseModel = python.reference({
    name: "BaseModel",
    modulePath: ["pydantic"]
});

export const Field = python.reference({
    name: "Field",
    modulePath: ["pydantic"]
});

export const RootModel = (type: python.Type): python.Reference =>
    python.reference({
        name: "RootModel",
        modulePath: ["pydantic"],
        genericTypes: [type]
    });
