import Foundation

public enum Language: String, Codable, Hashable, CaseIterable, Sendable {
    case java = "JAVA"
    case javascript = "JAVASCRIPT"
    case python = "PYTHON"
}

@available(macOS 12.3, iOS 15.4, tvOS 15.4, watchOS 8.5, *)
extension Language: CodingKeyRepresentable {
    public var codingKey: any CodingKey {
        guard let data = try? JSONEncoder().encode(self),
              let stringValue = try? JSONDecoder().decode(String.self, from: data) else {
            return StringKey("")
        }
        return StringKey(stringValue)
    }

    public init?<T>(codingKey: T) where T: CodingKey {
        guard let data = try? JSONEncoder().encode(codingKey.stringValue),
              let value = try? JSONDecoder().decode(Self.self, from: data) else {
            return nil
        }
        self = value
    }
}
