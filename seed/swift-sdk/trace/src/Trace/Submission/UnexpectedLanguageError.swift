public struct UnexpectedLanguageError: Codable, Hashable {
    public let expectedLanguage: Language
    public let actualLanguage: Language
}