import Foundation

/// This type tests that string fields containing datetime-like values
/// are NOT reformatted by the wire test generator. The string field
/// should preserve its exact value even if it looks like a datetime.
public struct ObjectWithDatetimeLikeString: Codable, Hashable, Sendable {
    /// A string field that happens to contain a datetime-like value
    public let datetimeLikeString: String
    /// An actual datetime field for comparison
    public let actualDatetime: Date
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        datetimeLikeString: String,
        actualDatetime: Date,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.datetimeLikeString = datetimeLikeString
        self.actualDatetime = actualDatetime
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.datetimeLikeString = try container.decode(String.self, forKey: .datetimeLikeString)
        self.actualDatetime = try container.decode(Date.self, forKey: .actualDatetime)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.datetimeLikeString, forKey: .datetimeLikeString)
        try container.encode(self.actualDatetime, forKey: .actualDatetime)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case datetimeLikeString
        case actualDatetime
    }
}