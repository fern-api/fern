using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types.Union;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Union;

[NUnit.Framework.TestFixture]
public class GetAndReturnUnionTest : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
            new SeedExhaustive.Types.Union.Animal(
                new SeedExhaustive.Types.Union.Animal.Dog(
                    new SeedExhaustive.Types.Union.Dog { Name = "name", LikesToWoof = true }
                )
            )
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Union.Animal>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }
}
