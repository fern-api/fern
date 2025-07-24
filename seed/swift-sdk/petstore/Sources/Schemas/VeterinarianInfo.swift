public struct VeterinarianInfo: Codable, Hashable {
    public let clinicName: String?
    public let contactMethod: ContactMethod?
    public let emailAddress: String?
    public let emergencyContactAvailable: Bool?
    public let firstName: String
    public let id: Int64
    public let lastName: String
    public let licenseNumber: String
    public let phoneNumber: String?
    public let specialization: String?
    public let yearsExperience: Int?
    public let additionalProperties: [String: JSONValue]

    public init(clinicName: String? = nil, contactMethod: ContactMethod? = nil, emailAddress: String? = nil, emergencyContactAvailable: Bool? = nil, firstName: String, id: Int64, lastName: String, licenseNumber: String, phoneNumber: String? = nil, specialization: String? = nil, yearsExperience: Int? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.clinicName = clinicName
        self.contactMethod = contactMethod
        self.emailAddress = emailAddress
        self.emergencyContactAvailable = emergencyContactAvailable
        self.firstName = firstName
        self.id = id
        self.lastName = lastName
        self.licenseNumber = licenseNumber
        self.phoneNumber = phoneNumber
        self.specialization = specialization
        self.yearsExperience = yearsExperience
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.clinicName = try container.decodeIfPresent(String.self, forKey: .clinicName)
        self.contactMethod = try container.decodeIfPresent(ContactMethod.self, forKey: .contactMethod)
        self.emailAddress = try container.decodeIfPresent(String.self, forKey: .emailAddress)
        self.emergencyContactAvailable = try container.decodeIfPresent(Bool.self, forKey: .emergencyContactAvailable)
        self.firstName = try container.decode(String.self, forKey: .firstName)
        self.id = try container.decode(Int64.self, forKey: .id)
        self.lastName = try container.decode(String.self, forKey: .lastName)
        self.licenseNumber = try container.decode(String.self, forKey: .licenseNumber)
        self.phoneNumber = try container.decodeIfPresent(String.self, forKey: .phoneNumber)
        self.specialization = try container.decodeIfPresent(String.self, forKey: .specialization)
        self.yearsExperience = try container.decodeIfPresent(Int.self, forKey: .yearsExperience)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.clinicName, forKey: .clinicName)
        try container.encodeIfPresent(self.contactMethod, forKey: .contactMethod)
        try container.encodeIfPresent(self.emailAddress, forKey: .emailAddress)
        try container.encodeIfPresent(self.emergencyContactAvailable, forKey: .emergencyContactAvailable)
        try container.encode(self.firstName, forKey: .firstName)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.lastName, forKey: .lastName)
        try container.encode(self.licenseNumber, forKey: .licenseNumber)
        try container.encodeIfPresent(self.phoneNumber, forKey: .phoneNumber)
        try container.encodeIfPresent(self.specialization, forKey: .specialization)
        try container.encodeIfPresent(self.yearsExperience, forKey: .yearsExperience)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case clinicName = "clinic_name"
        case contactMethod = "contact_method"
        case emailAddress = "email_address"
        case emergencyContactAvailable = "emergency_contact_available"
        case firstName = "first_name"
        case id
        case lastName = "last_name"
        case licenseNumber = "license_number"
        case phoneNumber = "phone_number"
        case specialization
        case yearsExperience = "years_experience"
    }
}