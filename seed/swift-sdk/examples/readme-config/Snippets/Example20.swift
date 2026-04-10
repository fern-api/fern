import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.createbigentity(request: .init(
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
            book: .value("book"),
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
            MetadataHtml(
                value: "value"
            )
        ),
        commonMetadata: CommonsMetadata(
            id: "id",
            data: .value([
                "data": .value("data")
            ]),
            jsonString: .value("jsonString")
        ),
        eventInfo: CommonsEventInfo.commonsEventInfoZero(
            CommonsEventInfoZero(
                id: "id",
                data: .value([
                    "data": .value("data")
                ]),
                jsonString: .value("jsonString"),
                type: .metadata
            )
        ),
        data: CommonsData.string(
            CommonsDataString(
                value: "value"
            )
        ),
        migration: Migration(
            name: "name",
            status: .running
        ),
        exception: Exception.exceptionZero(
            ExceptionZero(
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace",
                type: .generic
            )
        ),
        test: Test.and(
            TestAnd(
                value: true
            )
        ),
        node: Node(
            name: "name",
            nodes: .value([
                Node(
                    name: "name",
                    nodes: .value([
                        Node(
                            name: "name"
                        ),
                        Node(
                            name: "name"
                        )
                    ]),
                    trees: .value([
                        Tree(

                        ),
                        Tree(

                        )
                    ])
                ),
                Node(
                    name: "name",
                    nodes: .value([
                        Node(
                            name: "name"
                        ),
                        Node(
                            name: "name"
                        )
                    ]),
                    trees: .value([
                        Tree(

                        ),
                        Tree(

                        )
                    ])
                )
            ]),
            trees: .value([
                Tree(
                    nodes: .value([])
                ),
                Tree(
                    nodes: .value([])
                )
            ])
        ),
        directory: Directory(
            name: "name",
            files: .value([
                File(
                    name: "name",
                    contents: "contents"
                ),
                File(
                    name: "name",
                    contents: "contents"
                )
            ]),
            directories: .value([
                Directory(
                    name: "name",
                    files: .value([]),
                    directories: .value([
                        Directory(
                            name: "name"
                        ),
                        Directory(
                            name: "name"
                        )
                    ])
                ),
                Directory(
                    name: "name",
                    files: .value([]),
                    directories: .value([
                        Directory(
                            name: "name"
                        ),
                        Directory(
                            name: "name"
                        )
                    ])
                )
            ])
        ),
        moment: Moment(
            id: "id",
            date: CalendarDate("2023-01-15")!,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        )
    ))
}

try await main()
