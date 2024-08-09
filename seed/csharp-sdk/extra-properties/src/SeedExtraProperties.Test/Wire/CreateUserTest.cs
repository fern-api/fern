using NUnit.Framework;
using SeedExtraProperties;
using SeedExtraProperties.Core;
using SeedExtraProperties.Test.Utils;
using SeedExtraProperties.Test.Wire;

#nullable enable

namespace SeedExtraProperties.Test;

[TestFixture]
public class CreateUserTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "_type": "CreateUserRequest",
              "_version": "v1",
              "name": "string"
            }
            """;

        const string mockResponse = """
            {
              "name": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .User.CreateUserAsync(
                new CreateUserRequest
                {
                    Type = "CreateUserRequest",
                    Version = "v1",
                    Name = "string"
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
