import Api

let client = SeedApiClient()

try await client.search(
    request: .init(
        limit: 1,
        id: "id",
        date: "date",
        deadline: Date(timeIntervalSince1970: 1705311000),
        bytes: "bytes",
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
        neighbor: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        neighborRequired: SearchRequestNeighborRequired.user(
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        )
    )
)
