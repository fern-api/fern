import Foundation

/// Represents a file with its data and optional metadata for multipart uploads
public struct FormFile {
    /// The file data
    public let data: Foundation.Data
    /// Optional filename
    public let filename: Swift.String?

    public init(data: Foundation.Data, filename: Swift.String? = nil) {
        self.data = data
        self.filename = filename
    }
}

// MARK: - Convenience Initializers

extension FormFile {
    /// Create a FormFile from raw Data with no metadata
    /// - Parameter data: The file data
    public static func data(_ data: Foundation.Data) -> FormFile {
        return FormFile(data: data)
    }

    /// Create a FormFile from Data with a filename
    /// - Parameters:
    ///   - data: The file data
    ///   - filename: The filename
    public static func named(_ data: Foundation.Data, filename: Swift.String) -> FormFile {
        return FormFile(data: data, filename: filename)
    }
}
