public struct VaccinationRecord: Codable, Hashable {
    public let createdAt: Date
    public let id: Int64?
    public let nextDueDate: String
    public let notes: String?
    public let petId: Int64
    public let updatedAt: Date?
    public let urgencyLevel: UrgencyLevel?
    public let vaccinationDate: String
    public let vaccinationSite: String?
    public let vaccineName: String
    public let veterinarianId: Int64
    public let additionalProperties: [String: JSONValue]

    public init(createdAt: Date, id: Int64? = nil, nextDueDate: String, notes: String? = nil, petId: Int64, updatedAt: Date? = nil, urgencyLevel: UrgencyLevel? = nil, vaccinationDate: String, vaccinationSite: String? = nil, vaccineName: String, veterinarianId: Int64, additionalProperties: [String: JSONValue] = .init()) {
        self.createdAt = createdAt
        self.id = id
        self.nextDueDate = nextDueDate
        self.notes = notes
        self.petId = petId
        self.updatedAt = updatedAt
        self.urgencyLevel = urgencyLevel
        self.vaccinationDate = vaccinationDate
        self.vaccinationSite = vaccinationSite
        self.vaccineName = vaccineName
        self.veterinarianId = veterinarianId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.id = try container.decodeIfPresent(Int64.self, forKey: .id)
        self.nextDueDate = try container.decode(String.self, forKey: .nextDueDate)
        self.notes = try container.decodeIfPresent(String.self, forKey: .notes)
        self.petId = try container.decode(Int64.self, forKey: .petId)
        self.updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        self.urgencyLevel = try container.decodeIfPresent(UrgencyLevel.self, forKey: .urgencyLevel)
        self.vaccinationDate = try container.decode(String.self, forKey: .vaccinationDate)
        self.vaccinationSite = try container.decodeIfPresent(String.self, forKey: .vaccinationSite)
        self.vaccineName = try container.decode(String.self, forKey: .vaccineName)
        self.veterinarianId = try container.decode(Int64.self, forKey: .veterinarianId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encode(self.nextDueDate, forKey: .nextDueDate)
        try container.encodeIfPresent(self.notes, forKey: .notes)
        try container.encode(self.petId, forKey: .petId)
        try container.encodeIfPresent(self.updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(self.urgencyLevel, forKey: .urgencyLevel)
        try container.encode(self.vaccinationDate, forKey: .vaccinationDate)
        try container.encodeIfPresent(self.vaccinationSite, forKey: .vaccinationSite)
        try container.encode(self.vaccineName, forKey: .vaccineName)
        try container.encode(self.veterinarianId, forKey: .veterinarianId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case createdAt = "created_at"
        case id
        case nextDueDate = "next_due_date"
        case notes
        case petId = "pet_id"
        case updatedAt = "updated_at"
        case urgencyLevel = "urgency_level"
        case vaccinationDate = "vaccination_date"
        case vaccinationSite = "vaccination_site"
        case vaccineName = "vaccine_name"
        case veterinarianId = "veterinarian_id"
    }
}