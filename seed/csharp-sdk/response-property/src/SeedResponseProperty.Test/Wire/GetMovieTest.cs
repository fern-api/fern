using NUnit.Framework;
using SeedResponseProperty.Core;
using SeedResponseProperty.Test.Utils;
using SeedResponseProperty.Test.Wire;

#nullable enable

namespace SeedResponseProperty.Test;

[TestFixture]
public class GetMovieTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            "string"
            """;

        const string mockResponse = """
            {
              "id": "string",
              "name": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/movie")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.GetMovieAsync("string").Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
