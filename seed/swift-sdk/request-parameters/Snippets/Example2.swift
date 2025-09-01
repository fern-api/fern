import RequestParameters

let client = SeedRequestParametersClient()

try await client.user.getUsername(
    request: .init(
        limit: 1,
        id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        date: Date(timeIntervalSince1970: 1673740800),
        deadline: Date(timeIntervalSince1970: 1705311000),
        bytes: "SGVsbG8gd29ybGQh",
        user: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        userList: [
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ],
        optionalDeadline: Date(timeIntervalSince1970: 1705311000),
        keyValue: [
            "keyValue": "keyValue"
        ],
        optionalString: "optionalString",
        nestedUser: NestedUser(
            name: "name",
            user: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ),
        optionalUser: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        excludeUser: [
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ],
        filter: [
            "filter"
        ],
        longParam: 1000000,
        bigIntParam: 
    )
)
