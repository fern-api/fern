import Foundation

public enum V2FunctionSignature: Codable, Hashable, Sendable {
    case v2FunctionSignatureOne(V2FunctionSignatureOne)
    case v2FunctionSignatureTwo(V2FunctionSignatureTwo)
    case v2FunctionSignatureZero(V2FunctionSignatureZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2FunctionSignatureOne.self) {
            self = .v2FunctionSignatureOne(value)
        } else if let value = try? container.decode(V2FunctionSignatureTwo.self) {
            self = .v2FunctionSignatureTwo(value)
        } else if let value = try? container.decode(V2FunctionSignatureZero.self) {
            self = .v2FunctionSignatureZero(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .v2FunctionSignatureOne(let value):
            try container.encode(value)
        case .v2FunctionSignatureTwo(let value):
            try container.encode(value)
        case .v2FunctionSignatureZero(let value):
            try container.encode(value)
        }
    }
}