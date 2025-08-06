public enum Operand: String, Codable, Hashable, CaseIterable, Sendable {
    case greaterThan = ">"
    case equalTo = "="
    /// The name and value should be similar
    /// are similar for less than.
    case lessThan = "less_than"
}