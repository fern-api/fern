using NUnit.Framework;
using SeedExtraProperties;
using SeedExtraProperties.Test.Unit.MockServer;
using SeedExtraProperties.Test.Utils;

namespace SeedExtraProperties.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "Alice",
              "_type": "CreateUserRequest",
              "_version": "v1",
              "age": 30,
              "location": "Wonderland"
            }
            """;

        const string mockResponse = """
            {
              "name": "Alice",
              "age": 30,
              "location": "Wonderland"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.CreateUserAsync(
            new CreateUserRequest
            {
                Name = "Alice",
                Type = "CreateUserRequest",
                Version = "v1",
                AdditionalProperties = new AdditionalProperties
                {
                    ["age"] = 30,
                    ["location"] = "Wonderland",
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
