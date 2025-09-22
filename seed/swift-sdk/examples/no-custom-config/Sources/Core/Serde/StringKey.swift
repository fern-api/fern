import Foundation

struct StringKey: CodingKey, Hashable {
    var stringValue: String
    var intValue: Int? { Int(stringValue) }

    init(_ string: String) {
        self.stringValue = string
    }

    init?(stringValue: String) {
        self.stringValue = stringValue
    }

    init?(intValue: Int) {
        self.stringValue = String(intValue)
    }
}
