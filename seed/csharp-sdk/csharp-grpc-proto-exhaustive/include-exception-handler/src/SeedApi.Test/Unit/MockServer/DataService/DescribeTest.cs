using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DescribeTest
{
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
                var mockObject = JsonUtils.Deserialize<DescribeResponse>(mockResponse);
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

        var response = await client.DataService.DescribeAsync(new SeedApi.DescribeRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
