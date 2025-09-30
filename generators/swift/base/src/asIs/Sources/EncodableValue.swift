import Foundation

/// Type-erased wrapper for encodable values
struct EncodableValue {
    let value: any Encodable

    init<T: Encodable>(_ value: T) {
        self.value = value
    }
}
