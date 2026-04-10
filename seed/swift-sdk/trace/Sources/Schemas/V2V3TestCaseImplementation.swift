import Foundation

public struct V2V3TestCaseImplementation: Codable, Hashable, Sendable {
    public let description: V2V3TestCaseImplementationDescription
    public let function: V2V3TestCaseFunction
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        description: V2V3TestCaseImplementationDescription,
        function: V2V3TestCaseFunction,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.description = description
        self.function = function
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.description = try container.decode(V2V3TestCaseImplementationDescription.self, forKey: .description)
        self.function = try container.decode(V2V3TestCaseFunction.self, forKey: .function)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.description, forKey: .description)
        try container.encode(self.function, forKey: .function)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case description
        case function
    }
}