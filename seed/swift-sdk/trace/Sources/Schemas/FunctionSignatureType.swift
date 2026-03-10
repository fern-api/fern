import Foundation

public enum FunctionSignatureType: Codable, Hashable, Sendable {
    case nonVoid(NonVoidFunctionSignatureType)
    case void(VoidFunctionSignatureType)
    /// Useful when specifying custom grading for a testcase where actualResult is defined.
    case voidThatTakesActualResult(VoidFunctionSignatureThatTakesActualResultType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "nonVoid":
            self = .nonVoid(try NonVoidFunctionSignatureType(from: decoder))
        case "void":
            self = .void(try VoidFunctionSignatureType(from: decoder))
        case "voidThatTakesActualResult":
            self = .voidThatTakesActualResult(try VoidFunctionSignatureThatTakesActualResultType(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .nonVoid(let data):
            try container.encode("nonVoid", forKey: .type)
            try data.encode(to: encoder)
        case .void(let data):
            try container.encode("void", forKey: .type)
            try data.encode(to: encoder)
        case .voidThatTakesActualResult(let data):
            try container.encode("voidThatTakesActualResult", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}