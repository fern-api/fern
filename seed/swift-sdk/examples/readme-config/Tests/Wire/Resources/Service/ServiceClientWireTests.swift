import Foundation
import Testing
import Api

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getmovie1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "prequel": "prequel",
                  "title": "title",
                  "from": "from",
                  "rating": 1.1,
                  "type": "movie",
                  "tag": "tag",
                  "book": "book",
                  "metadata": {
                    "key": "value"
                  },
                  "revenue": 1000000
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Movie(
            id: "id",
            prequel: Optional("prequel"),
            title: "title",
            from: "from",
            rating: 1.1,
            type: .movie,
            tag: "tag",
            book: Optional(Nullable<String>.value("book")),
            metadata: [
                "key": JSONValue.string("value")
            ],
            revenue: 1000000
        )
        let response = try await client.service.getmovie(
            movieId: "movieId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmovie2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "prequel": "prequel",
                  "title": "title",
                  "from": "from",
                  "rating": 1.1,
                  "type": "movie",
                  "tag": "tag",
                  "book": "book",
                  "metadata": {
                    "metadata": {
                      "key": "value"
                    }
                  },
                  "revenue": 1000000
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Movie(
            id: "id",
            prequel: Optional("prequel"),
            title: "title",
            from: "from",
            rating: 1.1,
            type: .movie,
            tag: "tag",
            book: Optional(Nullable<String>.value("book")),
            metadata: [
                "metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ],
            revenue: 1000000
        )
        let response = try await client.service.getmovie(
            movieId: "movieId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createmovie1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.createmovie(
            request: Movie(
                id: "id",
                title: "title",
                from: "from",
                rating: 1.1,
                type: .movie,
                tag: "tag",
                metadata: [
                    "key": .string("value")
                ],
                revenue: 1000000
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createmovie2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.createmovie(
            request: Movie(
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
                revenue: 1000000
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getmetadata1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "value": "value",
                  "type": "html",
                  "extra": {
                    "key": "value"
                  },
                  "tags": [
                    "string"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Metadata.html(
            .init(
                value: Optional("value"),
                additionalProperties: [
                    "type": JSONValue.string("html"), 
                    "extra": JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    ), 
                    "tags": JSONValue.array([
                        JSONValue.string("string")
                    ])
                ]
            )
        )
        let response = try await client.service.getmetadata(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getmetadata2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "html",
                  "value": "value",
                  "extra": {
                    "extra": "extra"
                  },
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Metadata.html(
            .init(
                value: Optional("value"),
                additionalProperties: [
                    "type": JSONValue.string("html"), 
                    "extra": JSONValue.object(
                        [
                            "extra": JSONValue.string("extra")
                        ]
                    ), 
                    "tags": JSONValue.array([
                        JSONValue.string("tags"),
                        JSONValue.string("tags")
                    ])
                ]
            )
        )
        let response = try await client.service.getmetadata(
            shallow: .value(true),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createbigentity1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "response": {
                    "key": "value"
                  },
                  "identifiers": [
                    {
                      "type": "primitive",
                      "value": "value",
                      "label": "label"
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            response: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ),
            identifiers: [
                Identifier(
                    type: `Type`.basicType(
                        .primitive
                    ),
                    value: "value",
                    label: "label"
                )
            ]
        )
        let response = try await client.service.createbigentity(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createbigentity2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "response": {
                    "key": "value"
                  },
                  "identifiers": [
                    {
                      "type": "primitive",
                      "value": "value",
                      "label": "label"
                    },
                    {
                      "type": "primitive",
                      "value": "value",
                      "label": "label"
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            response: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ),
            identifiers: [
                Identifier(
                    type: `Type`.basicType(
                        .primitive
                    ),
                    value: "value",
                    label: "label"
                ),
                Identifier(
                    type: `Type`.basicType(
                        .primitive
                    ),
                    value: "value",
                    label: "label"
                )
            ]
        )
        let response = try await client.service.createbigentity(
            request: .init(
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}