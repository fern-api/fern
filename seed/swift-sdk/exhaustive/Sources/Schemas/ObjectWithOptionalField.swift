public struct ObjectWithOptionalField: Codable, Hashable, Sendable {
    public let string: String?
    public let integer: Int?
    public let long: Int64?
    public let double: Double?
    public let bool: Bool?
    public let datetime: Date?
    public let date: Date?
    public let uuid: UUID?
    public let base64: String?
    public let list: [String]?
    public let set: JSONValue?
    public let map: [Int: String]?
    public let bigint: String?
    public let additionalProperties: [String: JSONValue]

    public init(
        string: String? = nil,
        integer: Int? = nil,
        long: Int64? = nil,
        double: Double? = nil,
        bool: Bool? = nil,
        datetime: Date? = nil,
        date: Date? = nil,
        uuid: UUID? = nil,
        base64: String? = nil,
        list: [String]? = nil,
        set: JSONValue? = nil,
        map: [Int: String]? = nil,
        bigint: String? = nil,
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
        self.string = try container.decodeIfPresent(String.self, forKey: .string)
        self.integer = try container.decodeIfPresent(Int.self, forKey: .integer)
        self.long = try container.decodeIfPresent(Int64.self, forKey: .long)
        self.double = try container.decodeIfPresent(Double.self, forKey: .double)
        self.bool = try container.decodeIfPresent(Bool.self, forKey: .bool)
        self.datetime = try container.decodeIfPresent(Date.self, forKey: .datetime)
        self.date = try container.decodeIfPresent(Date.self, forKey: .date)
        self.uuid = try container.decodeIfPresent(UUID.self, forKey: .uuid)
        self.base64 = try container.decodeIfPresent(String.self, forKey: .base64)
        self.list = try container.decodeIfPresent([String].self, forKey: .list)
        self.set = try container.decodeIfPresent(JSONValue.self, forKey: .set)
        self.map = try container.decodeIfPresent([Int: String].self, forKey: .map)
        self.bigint = try container.decodeIfPresent(String.self, forKey: .bigint)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.string, forKey: .string)
        try container.encodeIfPresent(self.integer, forKey: .integer)
        try container.encodeIfPresent(self.long, forKey: .long)
        try container.encodeIfPresent(self.double, forKey: .double)
        try container.encodeIfPresent(self.bool, forKey: .bool)
        try container.encodeIfPresent(self.datetime, forKey: .datetime)
        try container.encodeIfPresent(self.date, forKey: .date)
        try container.encodeIfPresent(self.uuid, forKey: .uuid)
        try container.encodeIfPresent(self.base64, forKey: .base64)
        try container.encodeIfPresent(self.list, forKey: .list)
        try container.encodeIfPresent(self.set, forKey: .set)
        try container.encodeIfPresent(self.map, forKey: .map)
        try container.encodeIfPresent(self.bigint, forKey: .bigint)
    }

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