import { python } from "@fern-api/python-ast";

export const datetime: python.Reference = python.reference({
    name: "datetime",
    modulePath: ["dt"]
});
