import Foundation

public enum SearchRequestQuery: Codable, Hashable, Sendable {
    case singleFilterSearchRequest(SingleFilterSearchRequest)
    case multipleFilterSearchRequest(MultipleFilterSearchRequest)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(SingleFilterSearchRequest.self) {
            self = .singleFilterSearchRequest(value)
        } else if let value = try? container.decode(MultipleFilterSearchRequest.self) {
            self = .multipleFilterSearchRequest(value)
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
        case .singleFilterSearchRequest(let value):
            try container.encode(value)
        case .multipleFilterSearchRequest(let value):
            try container.encode(value)
        }
    }
}