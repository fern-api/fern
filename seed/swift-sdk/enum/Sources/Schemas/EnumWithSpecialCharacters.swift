public enum EnumWithSpecialCharacters: String, Codable, Hashable, CaseIterable, Sendable {
    case bla = "\$bla"
    case yo = "\$yo"
}