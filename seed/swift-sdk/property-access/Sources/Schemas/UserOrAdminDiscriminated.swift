import Foundation

/// Example of an discriminated union
public enum UserOrAdminDiscriminated: Codable, Hashable, Sendable {
    case userOrAdminDiscriminatedAdmin(UserOrAdminDiscriminatedAdmin)
    case userOrAdminDiscriminatedTwo(UserOrAdminDiscriminatedTwo)
    case userOrAdminDiscriminatedZero(UserOrAdminDiscriminatedZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UserOrAdminDiscriminatedAdmin.self) {
            self = .userOrAdminDiscriminatedAdmin(value)
        } else if let value = try? container.decode(UserOrAdminDiscriminatedTwo.self) {
            self = .userOrAdminDiscriminatedTwo(value)
        } else if let value = try? container.decode(UserOrAdminDiscriminatedZero.self) {
            self = .userOrAdminDiscriminatedZero(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .userOrAdminDiscriminatedAdmin(let value):
            try container.encode(value)
        case .userOrAdminDiscriminatedTwo(let value):
            try container.encode(value)
        case .userOrAdminDiscriminatedZero(let value):
            try container.encode(value)
        }
    }
}