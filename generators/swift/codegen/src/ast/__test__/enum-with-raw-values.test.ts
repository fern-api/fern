import { swift } from "../../index.js";

describe("Enum", () => {
    describe("write", () => {
        it("should correctly render empty enum", () => {
            const enum_ = swift.enumWithRawValues({
                name: "EmptyEnum",
                cases: []
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum EmptyEnum {}"
            `);
        });

        it("should omit raw values if they are the same as the case names", () => {
            const enum_ = swift.enumWithRawValues({
                name: "Direction",
                conformances: ["String"],
                cases: [
                    { unsafeName: "north", rawValue: "north" },
                    { unsafeName: "south", rawValue: "south" },
                    { unsafeName: "east", rawValue: "east" },
                    { unsafeName: "west", rawValue: "west" }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum Direction: String {
                  case north
                  case south
                  case east
                  case west
              }"
            `);
        });

        it("should specify raw values if they are not the same as the case names", () => {
            const enum_ = swift.enumWithRawValues({
                name: "Direction",
                conformances: ["String"],
                cases: [
                    { unsafeName: "northWest", rawValue: "north-west" },
                    { unsafeName: "southWest", rawValue: "south-west" },
                    { unsafeName: "east", rawValue: "east" },
                    { unsafeName: "west", rawValue: "west" }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum Direction: String {
                  case northWest = "north-west"
                  case southWest = "south-west"
                  case east
                  case west
              }"
            `);
        });

        it("should handle reserved keywords in case names", () => {
            const enum_ = swift.enumWithRawValues({
                name: "KeywordEnum",
                cases: [
                    { unsafeName: "class", rawValue: "class" },
                    { unsafeName: "associatedtype", rawValue: "associated-type" },
                    { unsafeName: "north", rawValue: "north" }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum KeywordEnum {
                  case \`class\`
                  case \`associatedtype\` = "associated-type"
                  case north
              }"
            `);
        });

        it("should decode unlisted raw values into the unknown case when forward compatible", () => {
            const enum_ = swift.enumWithRawValues({
                name: "Operand",
                accessLevel: swift.AccessLevel.Public,
                conformances: [swift.Protocol.RawRepresentable, swift.Protocol.Codable, swift.Protocol.CaseIterable],
                cases: [
                    { unsafeName: "greaterThan", rawValue: ">" },
                    { unsafeName: "class", rawValue: "class" },
                    { unsafeName: "lessThan", rawValue: "less_than" }
                ],
                unknownCase: { unsafeName: "__unknown" }
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "public enum Operand: RawRepresentable, Codable, CaseIterable {
                  case greaterThan
                  case \`class\`
                  case lessThan
                  case __unknown(String)

                  public static let allCases: [Self] = [.greaterThan, .\`class\`, .lessThan]

                  public init(rawValue: String) {
                      switch rawValue {
                      case ">": self = .greaterThan
                      case "class": self = .\`class\`
                      case "less_than": self = .lessThan
                      default: self = .__unknown(rawValue)
                      }
                  }

                  public var rawValue: String {
                      switch self {
                      case .greaterThan: return ">"
                      case .\`class\`: return "class"
                      case .lessThan: return "less_than"
                      case .__unknown(let rawValue): return rawValue
                      }
                  }

                  public init(from decoder: Decoder) throws {
                      self.init(rawValue: try decoder.singleValueContainer().decode(String.self))
                  }

                  public func encode(to encoder: Encoder) throws {
                      var container = encoder.singleValueContainer()
                      try container.encode(rawValue)
                  }
              }"
            `);
        });

        it("should render a forward compatible enum without listed cases", () => {
            const enum_ = swift.enumWithRawValues({
                name: "Empty",
                conformances: [swift.Protocol.RawRepresentable, swift.Protocol.Codable],
                cases: [],
                unknownCase: { unsafeName: "__unknown" }
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum Empty: RawRepresentable, Codable {
                  case __unknown(String)

                  init(rawValue: String) {
                      switch rawValue {
                      default: self = .__unknown(rawValue)
                      }
                  }

                  var rawValue: String {
                      switch self {
                      case .__unknown(let rawValue): return rawValue
                      }
                  }

                  init(from decoder: Decoder) throws {
                      self.init(rawValue: try decoder.singleValueContainer().decode(String.self))
                  }

                  func encode(to encoder: Encoder) throws {
                      var container = encoder.singleValueContainer()
                      try container.encode(rawValue)
                  }
              }"
            `);
        });
    });
});
