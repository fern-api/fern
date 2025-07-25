public struct Order: Codable, Hashable {
    public let complete: Bool?
    public let id: Int64?
    public let petId: Int64?
    public let quantity: Int?
    public let shipDate: Date?
    public let status: OrderStatus?
    public let additionalProperties: [String: JSONValue]

    public init(
        complete: Bool? = nil,
        id: Int64? = nil,
        petId: Int64? = nil,
        quantity: Int? = nil,
        shipDate: Date? = nil,
        status: OrderStatus? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.complete = complete
        self.id = id
        self.petId = petId
        self.quantity = quantity
        self.shipDate = shipDate
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.complete = try container.decodeIfPresent(Bool.self, forKey: .complete)
        self.id = try container.decodeIfPresent(Int64.self, forKey: .id)
        self.petId = try container.decodeIfPresent(Int64.self, forKey: .petId)
        self.quantity = try container.decodeIfPresent(Int.self, forKey: .quantity)
        self.shipDate = try container.decodeIfPresent(Date.self, forKey: .shipDate)
        self.status = try container.decodeIfPresent(OrderStatus.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.complete, forKey: .complete)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encodeIfPresent(self.petId, forKey: .petId)
        try container.encodeIfPresent(self.quantity, forKey: .quantity)
        try container.encodeIfPresent(self.shipDate, forKey: .shipDate)
        try container.encodeIfPresent(self.status, forKey: .status)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case complete
        case id
        case petId
        case quantity
        case shipDate
        case status
    }
}