import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema.js";
import { ClassReference } from "../ClassReference.js";
import { Writer } from "../core/Writer.js";

describe("ClassReference", () => {
    const writerConfig: Writer.Args = { customConfig: BaseRubyCustomConfigSchema.parse({}) };

    test("writes a relative reference by default", () => {
        const reference = new ClassReference({ name: "Client", modules: ["Acme", "Service"] });

        expect(reference.toString(writerConfig)).toBe("Acme::Service::Client");
    });

    test("writes a fully qualified reference from the top-level namespace", () => {
        const reference = new ClassReference({
            name: "Client",
            modules: ["Acme", "Service"],
            fullyQualified: true
        });

        expect(reference.toString(writerConfig)).toBe("::Acme::Service::Client");
    });
});
