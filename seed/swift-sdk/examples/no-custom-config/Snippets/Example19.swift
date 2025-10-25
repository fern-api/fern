import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.createBigEntity(request: BigEntity(
        castMember: CastMember.actor(
            Actor(
                name: "name",
                id: "id"
            )
        ),
        extendedMovie: ExtendedMovie(
            id: "id",
            prequel: "prequel",
            title: "title",
            from: "from",
            rating: 1.1,
            type: .movie,
            tag: "tag",
            book: "book",
            metadata: [
                "metadata": .object([
                    "key": .string("value")
                ])
            ],
            revenue: 1000000,
            cast: [
                "cast",
                "cast"
            ]
        ),
        entity: Entity(
            type: `Type`.basicType(
                .primitive
            ),
            name: "name"
        ),
        metadata: Metadata.html(
            .init(
                extra: [
                    "extra": "extra"
                ],
                tags: ,
                html: 
            )
        ),
        commonMetadata: Metadata(
            id: "id",
            data: [
                "data": "data"
            ],
            jsonString: "jsonString"
        ),
        eventInfo: EventInfo.metadata(
            .init(
                id: "id",
                data: [
                    "data": "data"
                ],
                jsonString: "jsonString"
            )
        ),
        data: Data.string(
            .init(
                string: 
            )
        ),
        migration: Migration(
            name: "name",
            status: .running
        ),
        exception: Exception.generic(
            .init(
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace"
            )
        ),
        test: Test.and(
            .init(
                and: 
            )
        ),
        node: Node(
            name: "name",
            nodes: [
                Node(
                    name: "name",
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ],
                    trees: [
                        Tree(
                            nodes: []
                        ),
                        Tree(
                            nodes: []
                        )
                    ]
                ),
                Node(
                    name: "name",
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ],
                    trees: [
                        Tree(
                            nodes: []
                        ),
                        Tree(
                            nodes: []
                        )
                    ]
                )
            ],
            trees: [
                Tree(
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ]
                ),
                Tree(
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ]
                )
            ]
        ),
        directory: Directory(
            name: "name",
            files: [
                File(
                    name: "name",
                    contents: "contents"
                ),
                File(
                    name: "name",
                    contents: "contents"
                )
            ],
            directories: [
                Directory(
                    name: "name",
                    files: [
                        File(
                            name: "name",
                            contents: "contents"
                        ),
                        File(
                            name: "name",
                            contents: "contents"
                        )
                    ],
                    directories: [
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        ),
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        )
                    ]
                ),
                Directory(
                    name: "name",
                    files: [
                        File(
                            name: "name",
                            contents: "contents"
                        ),
                        File(
                            name: "name",
                            contents: "contents"
                        )
                    ],
                    directories: [
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        ),
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        )
                    ]
                )
            ]
        ),
        moment: Moment(
            id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            date: CalendarDate("2023-01-15")!,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        )
    ))
}

try await main()
