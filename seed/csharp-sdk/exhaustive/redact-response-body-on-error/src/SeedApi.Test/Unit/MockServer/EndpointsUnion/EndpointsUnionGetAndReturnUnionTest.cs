using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsUnion;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsUnionGetAndReturnUnionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "animal": "dog",
              "name": "name",
              "likesToWoof": true
            }
            """;

        const string mockResponse = """
            {
              "animal": "dog",
              "name": "name",
              "likesToWoof": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/union")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsUnion.EndpointsUnionGetAndReturnUnionAsync(
            new TypesAnimalZero
            {
                Animal = TypesAnimalZeroAnimal.Dog,
                Name = "name",
                LikesToWoof = true,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "name": "name",
              "likesToWoof": true,
              "animal": "dog"
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "likesToWoof": true,
              "animal": "dog"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/union")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsUnion.EndpointsUnionGetAndReturnUnionAsync(
            new TypesAnimalZero
            {
                Name = "name",
                LikesToWoof = true,
                Animal = TypesAnimalZeroAnimal.Dog,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
