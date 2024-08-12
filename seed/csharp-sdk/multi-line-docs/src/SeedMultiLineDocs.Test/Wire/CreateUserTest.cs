using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Test.Wire;

#nullable enable

namespace SeedMultiLineDocs.Test;

[TestFixture]
public class CreateUserTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "name": "string",
              "age": 1
            }
            """;

        const string mockResponse = """
            {
              "id": "string",
              "name": "string",
              "age": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
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
            .User.CreateUserAsync(new CreateUserRequest { Name = "string", Age = 1 })
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
