public struct Product {
    let id: Int
    let name: String
    let price: Double

    public init(id: Int, name: String, price: Double) {
        self.id = id
        self.name = name
        self.price = price
    }

    public init?(from dictionary: [String: Any]) {
        guard let id = dictionary["id"] as? Int,
              let name = dictionary["name"] as? String,
              let price = dictionary["price"] as? Double else {
            return nil
        }
        self.id = id
        self.name = name
        self.price = price
    }
}