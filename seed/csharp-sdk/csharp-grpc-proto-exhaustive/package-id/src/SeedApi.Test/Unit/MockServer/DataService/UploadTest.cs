using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UploadTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "count": 1
            }
            """;

        var stub = new DataServiceStub().OnUpload(
            (request) =>
            {
                var mockObject = JsonUtils.Deserialize<UploadResponse>(mockResponse);
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

        var response = await client.DataService.UploadAsync(
            new SeedApi.UploadRequest
            {
                Columns = new List<SeedApi.Column>()
                {
                    new SeedApi.Column
                    {
                        Id = "id",
                        Values = new List<float>() { 1.1f },
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
