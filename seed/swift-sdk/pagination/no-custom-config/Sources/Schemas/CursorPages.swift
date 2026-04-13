import Foundation

public struct CursorPages: Codable, Hashable, Sendable {
    public let next: StartingAfterPaging?
    public let page: Nullable<Int>?
    public let perPage: Nullable<Int>?
    public let totalPages: Nullable<Int>?
    public let type: CursorPagesType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        next: StartingAfterPaging? = nil,
        page: Nullable<Int>? = nil,
        perPage: Nullable<Int>? = nil,
        totalPages: Nullable<Int>? = nil,
        type: CursorPagesType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.next = next
        self.page = page
        self.perPage = perPage
        self.totalPages = totalPages
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.next = try container.decodeIfPresent(StartingAfterPaging.self, forKey: .next)
        self.page = try container.decodeNullableIfPresent(Int.self, forKey: .page)
        self.perPage = try container.decodeNullableIfPresent(Int.self, forKey: .perPage)
        self.totalPages = try container.decodeNullableIfPresent(Int.self, forKey: .totalPages)
        self.type = try container.decode(CursorPagesType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.next, forKey: .next)
        try container.encodeNullableIfPresent(self.page, forKey: .page)
        try container.encodeNullableIfPresent(self.perPage, forKey: .perPage)
        try container.encodeNullableIfPresent(self.totalPages, forKey: .totalPages)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case next
        case page
        case perPage = "per_page"
        case totalPages = "total_pages"
        case type
    }
}