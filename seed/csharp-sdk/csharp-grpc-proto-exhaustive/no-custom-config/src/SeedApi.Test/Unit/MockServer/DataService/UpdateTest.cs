using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "updated_at": "2024-01-15T09:30:00Z",
              "index_type": "INDEX_TYPE_INVALID",
              "details": {
                "@type": "@type"
              },
              "index_types": [
                "INDEX_TYPE_INVALID",
                "INDEX_TYPE_INVALID"
              ],
              "status": "STATUS_UNSPECIFIED"
            }
            """;

        var stub = new DataServiceStub().OnUpdate(
            (request) =>
            {
                var mockObject = UpdateResponse.FromJson(mockResponse);
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

        var response = await client.DataService.UpdateAsync(
            new SeedApi.UpdateRequest
            {
                Id = "id",
                Values = new List<float>() { 1.1f, 1.1f },
                SetMetadata = new Dictionary<string, MetadataValue>() { { "set_metadata", 1.1 } },
                Namespace = "namespace",
                IndexedData = new SeedApi.IndexedData
                {
                    Indices = new List<uint>() { 1, 1 },
                    Values = new List<float>() { 1.1f, 1.1f },
                },
                IndexType = SeedApi.IndexType.IndexTypeInvalid,
                Details = new GoogleProtobufAny { Type = "@type" },
                IndexTypes = new List<SeedApi.IndexType>()
                {
                    SeedApi.IndexType.IndexTypeInvalid,
                    SeedApi.IndexType.IndexTypeInvalid,
                },
                AspectRatio = SeedApi.AspectRatio.AspectRatioUnspecified,
                Status = new GoogleRpcStatus
                {
                    Code = 1,
                    Message = "message",
                    Details = new List<object>()
                    {
                        new GoogleProtobufAny { Type = "@type" },
                        new GoogleProtobufAny { Type = "@type" },
                    },
                },
                Content = "SGVsbG8gd29ybGQh",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "updated_at": "2024-01-15T09:30:00Z",
              "index_type": "INDEX_TYPE_INVALID",
              "details": {
                "@type": "@type"
              },
              "index_types": [
                "INDEX_TYPE_INVALID"
              ],
              "status": "STATUS_UNSPECIFIED"
            }
            """;

        var stub = new DataServiceStub().OnUpdate(
            (request) =>
            {
                var mockObject = UpdateResponse.FromJson(mockResponse);
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

        var response = await client.DataService.UpdateAsync(
            new SeedApi.UpdateRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
