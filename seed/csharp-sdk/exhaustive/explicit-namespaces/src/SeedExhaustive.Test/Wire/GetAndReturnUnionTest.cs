using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Types.Union;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnUnionTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "animal": "dog",
              "name": "string",
              "likesToWoof": true
            }
            """;

        const string mockResponse = """
            {
              "animal": "dog",
              "name": "string",
              "likesToWoof": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/union")
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
            .Endpoints.Union.GetAndReturnUnionAsync(new Dog { Name = "string", LikesToWoof = true })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
