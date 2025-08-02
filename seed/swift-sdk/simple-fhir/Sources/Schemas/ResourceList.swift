public enum ResourceList: Codable, Hashable, Sendable {
    case account(Account)
    case patient(Patient)
    case practitioner(Practitioner)
    case script(Script)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}