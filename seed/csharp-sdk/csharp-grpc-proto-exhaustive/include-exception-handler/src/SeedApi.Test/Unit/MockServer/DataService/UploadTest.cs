using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UploadTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "count": 1
            }
            """;

        var stub = new DataServiceStub().OnUpload(
            (request) =>
            {
                var mockObject = UploadResponse.FromJson(mockResponse);
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

        var response = await await client.DataService.UploadAsync(
            new SeedApi.UploadRequest
            {
                Columns = new List<SeedApi.Column>()
                {
                    new SeedApi.Column
                    {
                        Id = "id",
                        Values = new List<float>() { 1.1f, 1.1f },
                        Metadata = new Dictionary<string, MetadataValue>() { { "metadata", 1.1 } },
                        IndexedData = new SeedApi.IndexedData
                        {
                            Indices = new List<uint>() { 1, 1 },
                            Values = new List<float>() { 1.1f, 1.1f },
                        },
                    },
                    new SeedApi.Column
                    {
                        Id = "id",
                        Values = new List<float>() { 1.1f, 1.1f },
                        Metadata = new Dictionary<string, MetadataValue>() { { "metadata", 1.1 } },
                        IndexedData = new SeedApi.IndexedData
                        {
                            Indices = new List<uint>() { 1, 1 },
                            Values = new List<float>() { 1.1f, 1.1f },
                        },
                    },
                },
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
              "count": 1
            }
            """;

        var stub = new DataServiceStub().OnUpload(
            (request) =>
            {
                var mockObject = UploadResponse.FromJson(mockResponse);
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

        var response = await await client.DataService.UploadAsync(
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
