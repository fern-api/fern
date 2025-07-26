public enum EnumWithCustom: String, Codable, Hashable, CaseIterable, Sendable {
    case safe
    case custom = "Custom"
}