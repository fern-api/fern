public struct CheckupRecord: Codable, Hashable {
    public let createdAt: Date
    public let examinationFindings: String?
    public let followUpRequired: Bool
    public let heartRateBpm: Int?
    public let id: Int64?
    public let notes: String?
    public let petId: Int64
    public let primaryTestResult: TestResult?
    public let temperatureCelsius: Float?
    public let updatedAt: Date?
    public let urgencyLevel: UrgencyLevel?
    public let veterinarianId: Int64
    public let weightKg: Float?
    public let additionalProperties: [String: JSONValue]

    public init(createdAt: Date, examinationFindings: String? = nil, followUpRequired: Bool, heartRateBpm: Int? = nil, id: Int64? = nil, notes: String? = nil, petId: Int64, primaryTestResult: TestResult? = nil, temperatureCelsius: Float? = nil, updatedAt: Date? = nil, urgencyLevel: UrgencyLevel? = nil, veterinarianId: Int64, weightKg: Float? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.createdAt = createdAt
        self.examinationFindings = examinationFindings
        self.followUpRequired = followUpRequired
        self.heartRateBpm = heartRateBpm
        self.id = id
        self.notes = notes
        self.petId = petId
        self.primaryTestResult = primaryTestResult
        self.temperatureCelsius = temperatureCelsius
        self.updatedAt = updatedAt
        self.urgencyLevel = urgencyLevel
        self.veterinarianId = veterinarianId
        self.weightKg = weightKg
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.examinationFindings = try container.decodeIfPresent(String.self, forKey: .examinationFindings)
        self.followUpRequired = try container.decode(Bool.self, forKey: .followUpRequired)
        self.heartRateBpm = try container.decodeIfPresent(Int.self, forKey: .heartRateBpm)
        self.id = try container.decodeIfPresent(Int64.self, forKey: .id)
        self.notes = try container.decodeIfPresent(String.self, forKey: .notes)
        self.petId = try container.decode(Int64.self, forKey: .petId)
        self.primaryTestResult = try container.decodeIfPresent(TestResult.self, forKey: .primaryTestResult)
        self.temperatureCelsius = try container.decodeIfPresent(Float.self, forKey: .temperatureCelsius)
        self.updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        self.urgencyLevel = try container.decodeIfPresent(UrgencyLevel.self, forKey: .urgencyLevel)
        self.veterinarianId = try container.decode(Int64.self, forKey: .veterinarianId)
        self.weightKg = try container.decodeIfPresent(Float.self, forKey: .weightKg)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encodeIfPresent(self.examinationFindings, forKey: .examinationFindings)
        try container.encode(self.followUpRequired, forKey: .followUpRequired)
        try container.encodeIfPresent(self.heartRateBpm, forKey: .heartRateBpm)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encodeIfPresent(self.notes, forKey: .notes)
        try container.encode(self.petId, forKey: .petId)
        try container.encodeIfPresent(self.primaryTestResult, forKey: .primaryTestResult)
        try container.encodeIfPresent(self.temperatureCelsius, forKey: .temperatureCelsius)
        try container.encodeIfPresent(self.updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(self.urgencyLevel, forKey: .urgencyLevel)
        try container.encode(self.veterinarianId, forKey: .veterinarianId)
        try container.encodeIfPresent(self.weightKg, forKey: .weightKg)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case createdAt = "created_at"
        case examinationFindings = "examination_findings"
        case followUpRequired = "follow_up_required"
        case heartRateBpm = "heart_rate_bpm"
        case id
        case notes
        case petId = "pet_id"
        case primaryTestResult = "primary_test_result"
        case temperatureCelsius = "temperature_celsius"
        case updatedAt = "updated_at"
        case urgencyLevel = "urgency_level"
        case veterinarianId = "veterinarian_id"
        case weightKg = "weight_kg"
    }
}