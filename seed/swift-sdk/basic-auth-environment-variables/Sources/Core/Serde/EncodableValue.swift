import Foundation

/// Type-erased wrapper for encodable values
struct EncodableValue {
    let value: any Swift.Encodable

    init<T: Swift.Encodable>(_ value: T) {
        self.value = value
    }
}
