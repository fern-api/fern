public enum EnumWithCustom: String, Codable, Hashable, Sendable, CaseIterable {
    case safe
    case custom = "Custom"
}