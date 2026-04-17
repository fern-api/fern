import Foundation

/// Tests that map value types with unknown types don't get spurious | undefined.
public typealias MapOfDocumentedUnknownType = [String: DocumentedUnknownType]
