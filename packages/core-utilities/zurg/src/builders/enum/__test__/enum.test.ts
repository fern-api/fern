import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { enum_ } from "../enum";

describe("enum", () => {
    itSchemaIdentity(enum_(["A", "B", "C"]), "A");

    itSchemaIdentity(enum_(["A", "B", "C"]), "D" as any, {
        opts: { allowUnrecognizedEnumValues: true },
    });

    itValidate("invalid enum", enum_(["A", "B", "C"]), "D", [
        {
            message: 'Expected enum. Received "D".',
            path: [],
        },
    ]);

    itValidate(
        "non-string",
        enum_(["A", "B", "C"]),
        [],
        [
            {
                message: "Expected string. Received list.",
                path: [],
            },
        ]
    );
});
