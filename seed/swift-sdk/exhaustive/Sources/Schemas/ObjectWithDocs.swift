import Foundation

public struct ObjectWithDocs: Codable, Hashable, Sendable {
    /// Characters that could lead to broken generated SDKs:
    /// 
    /// Markdown Escapes:
    /// - \_: Escaped underscore (e.g., FOO\_BAR)
    /// - \*: Escaped asterisk
    /// 
    /// JSDoc (JavaScript/TypeScript):
    /// - @: Used for JSDoc tags
    /// - {: }: Used for type definitions
    /// - <: >: HTML tags
    /// - *: Can interfere with comment blocks
    /// - /**: JSDoc comment start
    /// - ** /: JSDoc comment end
    /// - &: HTML entities
    /// 
    /// XMLDoc (C#):
    /// - <: >: XML tags
    /// - &: ': ": <: >: XML special characters
    /// - {: }: Used for interpolated strings
    /// - ///: Comment marker
    /// - /**: Block comment start
    /// - ** /: Block comment end
    /// 
    /// Javadoc (Java):
    /// - @: Used for Javadoc tags
    /// - <: >: HTML tags
    /// - &: HTML entities
    /// - *: Can interfere with comment blocks
    /// - /**: Javadoc comment start
    /// - ** /: Javadoc comment end
    /// 
    /// Doxygen (C++):
    /// - \: Used for Doxygen commands
    /// - @: Alternative command prefix
    /// - <: >: XML/HTML tags
    /// - &: HTML entities
    /// - /**: C-style comment start
    /// - ** /: C-style comment end
    /// 
    /// RDoc (Ruby):
    /// - :: Used in symbol notation
    /// - =: Section markers
    /// - #: Comment marker
    /// - =begin: Block comment start
    /// - =end: Block comment end
    /// - @: Instance variable prefix
    /// - $: Global variable prefix
    /// - %: String literal delimiter
    /// - #{: String interpolation start
    /// - }: String interpolation end
    /// 
    /// PHPDoc (PHP):
    /// - @: Used for PHPDoc tags
    /// - {: }: Used for type definitions
    /// - $: Variable prefix
    /// - /**: PHPDoc comment start
    /// - ** /: PHPDoc comment end
    /// - *: Can interfere with comment blocks
    /// - &: HTML entities
    public let string: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        string: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.string = string
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.string = try container.decode(String.self, forKey: .string)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.string, forKey: .string)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case string
    }
}