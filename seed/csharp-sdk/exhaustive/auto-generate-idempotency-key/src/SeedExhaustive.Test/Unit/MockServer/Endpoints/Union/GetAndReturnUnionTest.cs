using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Union;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnUnionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Union.GetAndReturnUnionAsync(
            new Animal(new Animal.Dog(new Dog { Name = "name", LikesToWoof = true }))
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
