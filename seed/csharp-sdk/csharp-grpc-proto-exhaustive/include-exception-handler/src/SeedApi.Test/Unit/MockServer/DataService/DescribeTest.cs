using global::System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DescribeTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "namespaces": {
                "namespaces": {
                  "count": 1
                }
              },
              "dimension": 1,
              "fullness": 1.1,
              "total_count": 1
            }
            """;

        var stub = new DataServiceStub().OnDescribe(
            (request) =>
            {
                var mockObject = DescribeResponse.FromJson(mockResponse);
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

        var response = await await client.DataService.DescribeAsync(
            new SeedApi.DescribeRequest
            {
                Filter = new Dictionary<string, MetadataValue>() { { "filter", 1.1 } },
                After = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "namespaces": {
                "key": {
                  "count": 1
                }
              },
              "dimension": 1,
              "fullness": 1.1,
              "total_count": 1
            }
            """;

        var stub = new DataServiceStub().OnDescribe(
            (request) =>
            {
                var mockObject = DescribeResponse.FromJson(mockResponse);
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

        var response = await await client.DataService.DescribeAsync(new SeedApi.DescribeRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
