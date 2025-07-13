public struct Account: Codable, Hashable {
    public let resourceType: Any
    public let name: String
    public let patient: Patient?
    public let practitioner: Practitioner?

    enum CodingKeys: String, CodingKey {
        case resourceType = "resource_type"
        case name
        case patient
        case practitioner
    }
}