using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "columns": [
                {
                  "id": "id"
                },
                {
                  "id": "id"
                }
              ],
              "pagination": {
                "next": "next"
              },
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        var stub = new DataServiceStub().OnList(
            (request) =>
            {
                var mockObject = ListResponse.FromJson(mockResponse);
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

        var response = await client.DataService.ListAsync(
            new SeedApi.ListRequest
            {
                Prefix = "prefix",
                Limit = 1,
                PaginationToken = "pagination_token",
                Namespace = "namespace",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "columns": [
                {
                  "id": "id"
                }
              ],
              "pagination": {
                "next": "next"
              },
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        var stub = new DataServiceStub().OnList(
            (request) =>
            {
                var mockObject = ListResponse.FromJson(mockResponse);
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

        var response = await client.DataService.ListAsync(new SeedApi.ListRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
