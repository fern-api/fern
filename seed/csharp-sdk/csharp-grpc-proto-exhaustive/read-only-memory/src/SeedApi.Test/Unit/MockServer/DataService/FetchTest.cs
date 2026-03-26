using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FetchTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "columns": {
                "columns": {
                  "id": "id",
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
              },
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        var stub = new DataServiceStub().OnFetch(
            (request) =>
            {
                var mockObject = FetchResponse.FromJson(mockResponse);
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
                GrpcOptions = new GrpcChannelOptions { HttpClient = mock.HttpClient },
            }
        );

        var response = await client.DataService.FetchAsync(
            new SeedApi.FetchRequest { Ids = ["ids"], Namespace = "namespace" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "columns": {
                "key": {
                  "id": "id",
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
              },
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        var stub = new DataServiceStub().OnFetch(
            (request) =>
            {
                var mockObject = FetchResponse.FromJson(mockResponse);
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
                GrpcOptions = new GrpcChannelOptions { HttpClient = mock.HttpClient },
            }
        );

        var response = await client.DataService.FetchAsync(new SeedApi.FetchRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
