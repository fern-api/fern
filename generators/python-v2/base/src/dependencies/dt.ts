import { python } from "@fern-api/python-ast"

export const datetime = python.reference({
    name: "datetime",
    modulePath: ["dt"]
})
