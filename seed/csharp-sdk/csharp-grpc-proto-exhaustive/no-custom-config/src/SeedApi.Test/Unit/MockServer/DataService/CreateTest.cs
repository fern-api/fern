using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "resource": {
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
              },
              "success": true,
              "error_message": "error_message"
            }
            """;

        var stub = new DataServiceStub().OnCreate(
            (request) =>
            {
                var mockObject = CreateResponse.FromJson(mockResponse);
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

        var response = await await client.DataService.CreateAsync(
            new SeedApi.CreateRequest
            {
                Name = "name",
                Description = "description",
                ToolChoice = new SeedApi.ToolChoice
                {
                    Mode = SeedApi.ToolMode.ToolModeInvalid,
                    FunctionName = "function_name",
                },
                Url = "url",
                Content = "content",
                Metadata = new Dictionary<string, MetadataValue>() { { "metadata", 1.1 } },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "resource": {
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
              },
              "success": true,
              "error_message": "error_message"
            }
            """;

        var stub = new DataServiceStub().OnCreate(
            (request) =>
            {
                var mockObject = CreateResponse.FromJson(mockResponse);
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

        var response = await await client.DataService.CreateAsync(
            new SeedApi.CreateRequest { Name = "name" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
