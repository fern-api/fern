public struct User: Codable {
    let id: Int
    private var name: String

    public func getId() -> Int {
        return self.id
    }

    public func getName() -> String {
        return self.name
    }

    public static func create(with id: Int, name: String) -> User {
        return User(id: id, name: name)
    }
}