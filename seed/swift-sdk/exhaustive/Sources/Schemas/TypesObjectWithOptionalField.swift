import Foundation

public struct TypesObjectWithOptionalField: Codable, Hashable, Sendable {
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    public let string: Nullable<String>?
    public let integer: Nullable<Int>?
    public let long: Nullable<Int64>?
    public let double: Nullable<Double>?
    public let bool: Nullable<Bool>?
    public let datetime: Nullable<Date>?
    public let date: Nullable<CalendarDate>?
    public let uuid: Nullable<String>?
    public let base64: Nullable<String>?
    public let list: Nullable<[String]>?
    public let set: Nullable<[String]>?
    public let map: Nullable<[String: Nullable<String>]>?
    public let bigint: Nullable<Int>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        string: Nullable<String>? = nil,
        integer: Nullable<Int>? = nil,
        long: Nullable<Int64>? = nil,
        double: Nullable<Double>? = nil,
        bool: Nullable<Bool>? = nil,
        datetime: Nullable<Date>? = nil,
        date: Nullable<CalendarDate>? = nil,
        uuid: Nullable<String>? = nil,
        base64: Nullable<String>? = nil,
        list: Nullable<[String]>? = nil,
        set: Nullable<[String]>? = nil,
        map: Nullable<[String: Nullable<String>]>? = nil,
        bigint: Nullable<Int>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.string = string
        self.integer = integer
        self.long = long
        self.double = double
        self.bool = bool
        self.datetime = datetime
        self.date = date
        self.uuid = uuid
        self.base64 = base64
        self.list = list
        self.set = set
        self.map = map
        self.bigint = bigint
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.string = try container.decodeNullableIfPresent(String.self, forKey: .string)
        self.integer = try container.decodeNullableIfPresent(Int.self, forKey: .integer)
        self.long = try container.decodeNullableIfPresent(Int64.self, forKey: .long)
        self.double = try container.decodeNullableIfPresent(Double.self, forKey: .double)
        self.bool = try container.decodeNullableIfPresent(Bool.self, forKey: .bool)
        self.datetime = try container.decodeNullableIfPresent(Date.self, forKey: .datetime)
        self.date = try container.decodeNullableIfPresent(CalendarDate.self, forKey: .date)
        self.uuid = try container.decodeNullableIfPresent(String.self, forKey: .uuid)
        self.base64 = try container.decodeNullableIfPresent(String.self, forKey: .base64)
        self.list = try container.decodeNullableIfPresent([String].self, forKey: .list)
        self.set = try container.decodeNullableIfPresent([String].self, forKey: .set)
        self.map = try container.decodeNullableIfPresent([String: Nullable<String>].self, forKey: .map)
        self.bigint = try container.decodeNullableIfPresent(Int.self, forKey: .bigint)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.string, forKey: .string)
        try container.encodeNullableIfPresent(self.integer, forKey: .integer)
        try container.encodeNullableIfPresent(self.long, forKey: .long)
        try container.encodeNullableIfPresent(self.double, forKey: .double)
        try container.encodeNullableIfPresent(self.bool, forKey: .bool)
        try container.encodeNullableIfPresent(self.datetime, forKey: .datetime)
        try container.encodeNullableIfPresent(self.date, forKey: .date)
        try container.encodeNullableIfPresent(self.uuid, forKey: .uuid)
        try container.encodeNullableIfPresent(self.base64, forKey: .base64)
        try container.encodeNullableIfPresent(self.list, forKey: .list)
        try container.encodeNullableIfPresent(self.set, forKey: .set)
        try container.encodeNullableIfPresent(self.map, forKey: .map)
        try container.encodeNullableIfPresent(self.bigint, forKey: .bigint)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case string
        case integer
        case long
        case double
        case bool
        case datetime
        case date
        case uuid
        case base64
        case list
        case set
        case map
        case bigint
    }
}