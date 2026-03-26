using Google.Protobuf;
using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTest
{
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
                return JsonParser.Default.Parse<Data.V1.Grpc.CreateResponse>(mockResponse);
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

        var response = await client.DataService.CreateAsync(
            new SeedApi.CreateRequest { Name = "name" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
