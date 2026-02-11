import { python } from "@fern-api/python-ast";

export const BaseModel: python.Reference = python.reference({
    name: "BaseModel",
    modulePath: ["pydantic"]
});

export const Field: python.Reference = python.reference({
    name: "Field",
    modulePath: ["pydantic"]
});

export const RootModel = (type: python.Type): python.Reference =>
    python.reference({
        name: "RootModel",
        modulePath: ["pydantic"],
        genericTypes: [type]
    });
