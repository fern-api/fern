import Foundation
import Testing
import Examples

@Suite("ServiceClient_ Wire Tests") struct ServiceClient_WireTests {
    @Test func getMovie1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "movie-c06a4ad7",
                  "prequel": "movie-cv9b914f",
                  "title": "The Boy and the Heron",
                  "from": "Hayao Miyazaki",
                  "rating": 8,
                  "type": "movie",
                  "tag": "tag-wf9as23d",
                  "metadata": {
                    "actors": [
                      "Christian Bale",
                      "Florence Pugh",
                      "Willem Dafoe"
                    ],
                    "releaseDate": "2023-12-08",
                    "ratings": {
                      "rottenTomatoes": 97,
                      "imdb": 7.6
                    }
                  },
                  "revenue": 1000000
                }
                """.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Movie(
            id: "movie-c06a4ad7",
            prequel: Optional("movie-cv9b914f"),
            title: "The Boy and the Heron",
            from: "Hayao Miyazaki",
            rating: 8,
            type: .movie,
            tag: "tag-wf9as23d",
            metadata: [
                "actors": JSONValue.array([
                    JSONValue.string("Christian Bale"),
                    JSONValue.string("Florence Pugh"),
                    JSONValue.string("Willem Dafoe")
                ]), 
                "releaseDate": JSONValue.string("2023-12-08"), 
                "ratings": JSONValue.object(
                    [
                        "rottenTomatoes": JSONValue.number(97), 
                        "imdb": JSONValue.number(7.6)
                    ]
                )
            ],
            revenue: 1000000
        )
        let response = try await client.service.getMovie(movieId: "movie-c06a4ad7")
        try #require(response == expectedResponse)
    }

    @Test func getMovie2() async throws -> Void {
        let stub = WireStub()
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
        let client = ExamplesClient(
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
            book: Optional("book"),
            metadata: [
                "metadata": JSONValue.object(
                    [
                        "key": JSONValue.string("value")
                    ]
                )
            ],
            revenue: 1000000
        )
        let response = try await client.service.getMovie(movieId: "movieId")
        try #require(response == expectedResponse)
    }

    @Test func createMovie1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                movie-c06a4ad7
                """.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "movie-c06a4ad7"
        let response = try await client.service.createMovie(request: Movie(
            id: "movie-c06a4ad7",
            prequel: "movie-cv9b914f",
            title: "The Boy and the Heron",
            from: "Hayao Miyazaki",
            rating: 8,
            type: .movie,
            tag: "tag-wf9as23d",
            metadata: [
                "actors": .array([
                    .string("Christian Bale"),
                    .string("Florence Pugh"),
                    .string("Willem Dafoe")
                ]), 
                "releaseDate": .string("2023-12-08"), 
                "ratings": .object([
                    "rottenTomatoes": .number(97), 
                    "imdb": .number(7.6)
                ])
            ],
            revenue: 1000000
        ))
        try #require(response == expectedResponse)
    }

    @Test func createMovie2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.createMovie(request: Movie(
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
            revenue: 1000000
        ))
        try #require(response == expectedResponse)
    }

    @Test func getMetadata1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "html",
                  "extra": {
                    "version": "0.0.1",
                    "tenancy": "test"
                  },
                  "tags": [
                    "development",
                    "public"
                  ],
                  "value": "<head>...</head>"
                }
                """.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "<head>...</head>"
        let response = try await client.service.getMetadata(
            shallow: false,
            tag: 
        )
        try #require(response == expectedResponse)
    }

    @Test func getMetadata2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "html",
                  "value": "string",
                  "extra": {
                    "extra": "extra"
                  },
                  "tags": [
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.getMetadata(
            shallow: true,
            tag: 
        )
        try #require(response == expectedResponse)
    }

    @Test func createBigEntity1() async throws -> Void {
        let stub = WireStub()
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
        let client = ExamplesClient(
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
        let response = try await client.service.createBigEntity(request: BigEntity(
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
        try #require(response == expectedResponse)
    }
}