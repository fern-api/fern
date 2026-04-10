import Foundation

public enum ErrorInfo: Codable, Hashable, Sendable {
    case compileError(CompileError)
    /// If the trace backend encounters an unexpected error.
    case internalError(InternalError)
    /// If the submission cannot be executed and throws a runtime error before getting to any of the testcases.
    case runtimeError(RuntimeError)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "compileError":
            self = .compileError(try CompileError(from: decoder))
        case "internalError":
            self = .internalError(try InternalError(from: decoder))
        case "runtimeError":
            self = .runtimeError(try RuntimeError(from: decoder))
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
        case .compileError(let data):
            try container.encode("compileError", forKey: .type)
            try data.encode(to: encoder)
        case .internalError(let data):
            try container.encode("internalError", forKey: .type)
            try data.encode(to: encoder)
        case .runtimeError(let data):
            try container.encode("runtimeError", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}