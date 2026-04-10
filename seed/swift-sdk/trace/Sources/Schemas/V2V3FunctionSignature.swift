import Foundation

public enum V2V3FunctionSignature: Codable, Hashable, Sendable {
    case v2V3FunctionSignatureOne(V2V3FunctionSignatureOne)
    case v2V3FunctionSignatureTwo(V2V3FunctionSignatureTwo)
    case v2V3FunctionSignatureZero(V2V3FunctionSignatureZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2V3FunctionSignatureOne.self) {
            self = .v2V3FunctionSignatureOne(value)
        } else if let value = try? container.decode(V2V3FunctionSignatureTwo.self) {
            self = .v2V3FunctionSignatureTwo(value)
        } else if let value = try? container.decode(V2V3FunctionSignatureZero.self) {
            self = .v2V3FunctionSignatureZero(value)
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
        case .v2V3FunctionSignatureOne(let value):
            try container.encode(value)
        case .v2V3FunctionSignatureTwo(let value):
            try container.encode(value)
        case .v2V3FunctionSignatureZero(let value):
            try container.encode(value)
        }
    }
}