import { python } from "../..";
import { Writer } from "../core/Writer";

describe("Variable", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes a variable with a name and type", () => {
        const variable = python.variable({
            name: "my_variable",
            type: python.annotation({ type: python.Type.str() })
        });
        variable.write(writer);
        expect(writer.toString()).toBe("my_variable: str");
    });

    it("writes a variable with a name, type, and value", () => {
        const variable = python.variable({
            name: "my_int",
            type: python.annotation({ type: python.Type.int() }),
            initializer: "42"
        });
        variable.write(writer);
        expect(writer.toString()).toBe("my_int: int = 42");
    });

    it("writes a variable with a complex type", () => {
        const variable = python.variable({
            name: "my_list",
            type: python.annotation({ type: python.Type.list(python.Type.int()) }),
            initializer: "[]"
        });
        variable.write(writer);
        expect(writer.toString()).toBe("my_list: List[int] = []");
    });

    it("writes a variable with an optional type", () => {
        const variable = python.variable({
            name: "maybe_string",
            type: python.annotation({ type: python.Type.optional(python.Type.str()) })
        });
        variable.write(writer);
        expect(writer.toString()).toBe("maybe_string: Optional[str]");
    });

    it("writes a variable with a union type", () => {
        const variable = python.variable({
            name: "id",
            type: python.annotation({ type: python.Type.union([python.Type.int(), python.Type.str()]) })
        });
        variable.write(writer);
        expect(writer.toString()).toBe("id: Union[int, str]");
    });

    it("writes a variable with a dictionary type", () => {
        const variable = python.variable({
            name: "config",
            type: python.annotation({ type: python.Type.dict(python.Type.str(), python.Type.any()) })
        });
        variable.write(writer);
        expect(writer.toString()).toBe("config: Dict[str, Any]");
    });

    it("writes a variable with a tuple type", () => {
        const variable = python.variable({
            name: "coordinates",
            type: python.annotation({ type: python.Type.tuple([python.Type.float(), python.Type.float()]) })
        });
        variable.write(writer);
        expect(writer.toString()).toBe("coordinates: Tuple[float, float]");
    });
});
