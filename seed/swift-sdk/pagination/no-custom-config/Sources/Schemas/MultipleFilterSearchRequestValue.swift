import Foundation

public indirect enum MultipleFilterSearchRequestValue: Codable, Hashable, Sendable {
    case multipleFilterSearchRequestArray([MultipleFilterSearchRequest])
    case singleFilterSearchRequestArray([SingleFilterSearchRequest])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode([MultipleFilterSearchRequest].self) {
            self = .multipleFilterSearchRequestArray(value)
        } else if let value = try? container.decode([SingleFilterSearchRequest].self) {
            self = .singleFilterSearchRequestArray(value)
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
        case .multipleFilterSearchRequestArray(let value):
            try container.encode(value)
        case .singleFilterSearchRequestArray(let value):
            try container.encode(value)
        }
    }
}