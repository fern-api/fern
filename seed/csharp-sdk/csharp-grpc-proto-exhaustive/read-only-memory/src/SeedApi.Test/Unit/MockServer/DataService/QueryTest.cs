using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class QueryTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "results": [
                {
                  "matches": [
                    {
                      "id": "id",
                      "score": 1.1,
                      "values": [
                        1.1,
                        1.1
                      ],
                      "metadata": {},
                      "indexed_data": {
                        "indices": [
                          1,
                          1
                        ],
                        "values": [
                          1.1,
                          1.1
                        ]
                      }
                    },
                    {
                      "id": "id",
                      "score": 1.1,
                      "values": [
                        1.1,
                        1.1
                      ],
                      "metadata": {},
                      "indexed_data": {
                        "indices": [
                          1,
                          1
                        ],
                        "values": [
                          1.1,
                          1.1
                        ]
                      }
                    }
                  ],
                  "namespace": "namespace"
                },
                {
                  "matches": [
                    {
                      "id": "id",
                      "score": 1.1,
                      "values": [
                        1.1,
                        1.1
                      ],
                      "metadata": {},
                      "indexed_data": {
                        "indices": [
                          1,
                          1
                        ],
                        "values": [
                          1.1,
                          1.1
                        ]
                      }
                    },
                    {
                      "id": "id",
                      "score": 1.1,
                      "values": [
                        1.1,
                        1.1
                      ],
                      "metadata": {},
                      "indexed_data": {
                        "indices": [
                          1,
                          1
                        ],
                        "values": [
                          1.1,
                          1.1
                        ]
                      }
                    }
                  ],
                  "namespace": "namespace"
                }
              ],
              "matches": [
                {
                  "id": "id",
                  "score": 1.1,
                  "values": [
                    1.1,
                    1.1
                  ],
                  "metadata": {
                    "metadata": 1.1
                  },
                  "indexed_data": {
                    "indices": [
                      1,
                      1
                    ],
                    "values": [
                      1.1,
                      1.1
                    ]
                  }
                },
                {
                  "id": "id",
                  "score": 1.1,
                  "values": [
                    1.1,
                    1.1
                  ],
                  "metadata": {
                    "metadata": 1.1
                  },
                  "indexed_data": {
                    "indices": [
                      1,
                      1
                    ],
                    "values": [
                      1.1,
                      1.1
                    ]
                  }
                }
              ],
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        var stub = new DataServiceStub().OnQuery(
            (request) =>
            {
                var mockObject = QueryResponse.FromJson(mockResponse);
                return mockObject.ToProto();
            }
        );

        await using var mock = await GrpcMockServerBuilder
            .Configure()
            .WithService<Data.V1.Grpc.DataService.DataServiceBase>(stub)
            .BuildAsync();

        var client = new SeedApiClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "http://localhost",
                MaxRetries = 0,
                GrpcOptions = new GrpcChannelOptions
                {
                    HttpClient = mock.Channel.CreateHttpClient(),
                },
            }
        );

        var response = await client.DataService.QueryAsync(
            new SeedApi.QueryRequest
            {
                Namespace = "namespace",
                TopK = 1,
                Filter = new Dictionary<string, MetadataValue>() { { "filter", 1.1 } },
                IncludeValues = true,
                IncludeMetadata = true,
                Queries = new List<SeedApi.QueryColumn>()
                {
                    new SeedApi.QueryColumn
                    {
                        Values = new[] { 1.1f, 1.1f },
                        TopK = 1,
                        Namespace = "namespace",
                        Filter = new Dictionary<string, MetadataValue>() { { "filter", 1.1 } },
                        IndexedData = new SeedApi.IndexedData
                        {
                            Indices = new List<uint>() { 1, 1 },
                            Values = new[] { 1.1f, 1.1f },
                        },
                    },
                    new SeedApi.QueryColumn
                    {
                        Values = new[] { 1.1f, 1.1f },
                        TopK = 1,
                        Namespace = "namespace",
                        Filter = new Dictionary<string, MetadataValue>() { { "filter", 1.1 } },
                        IndexedData = new SeedApi.IndexedData
                        {
                            Indices = new List<uint>() { 1, 1 },
                            Values = new[] { 1.1f, 1.1f },
                        },
                    },
                },
                Column = new[] { 1.1f, 1.1f },
                Id = "id",
                IndexedData = new SeedApi.IndexedData
                {
                    Indices = new List<uint>() { 1, 1 },
                    Values = new[] { 1.1f, 1.1f },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "results": [
                {
                  "matches": [
                    {
                      "id": "id"
                    }
                  ],
                  "namespace": "namespace"
                }
              ],
              "matches": [
                {
                  "id": "id",
                  "score": 1.1,
                  "values": [
                    1.1
                  ],
                  "metadata": {
                    "key": 1.1
                  },
                  "indexed_data": {
                    "indices": [
                      1
                    ],
                    "values": [
                      1.1
                    ]
                  }
                }
              ],
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        var stub = new DataServiceStub().OnQuery(
            (request) =>
            {
                var mockObject = QueryResponse.FromJson(mockResponse);
                return mockObject.ToProto();
            }
        );

        await using var mock = await GrpcMockServerBuilder
            .Configure()
            .WithService<Data.V1.Grpc.DataService.DataServiceBase>(stub)
            .BuildAsync();

        var client = new SeedApiClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "http://localhost",
                MaxRetries = 0,
                GrpcOptions = new GrpcChannelOptions
                {
                    HttpClient = mock.Channel.CreateHttpClient(),
                },
            }
        );

        var response = await client.DataService.QueryAsync(new SeedApi.QueryRequest { TopK = 1 });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
