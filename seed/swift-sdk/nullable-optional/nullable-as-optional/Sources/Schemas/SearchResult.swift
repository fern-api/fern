import Foundation

/// Undiscriminated union for testing
public enum SearchResult: Codable, Hashable, Sendable {
    case searchResultOne(SearchResultOne)
    case searchResultTwo(SearchResultTwo)
    case searchResultZero(SearchResultZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(SearchResultOne.self) {
            self = .searchResultOne(value)
        } else if let value = try? container.decode(SearchResultTwo.self) {
            self = .searchResultTwo(value)
        } else if let value = try? container.decode(SearchResultZero.self) {
            self = .searchResultZero(value)
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
        case .searchResultOne(let value):
            try container.encode(value)
        case .searchResultTwo(let value):
            try container.encode(value)
        case .searchResultZero(let value):
            try container.encode(value)
        }
    }
}