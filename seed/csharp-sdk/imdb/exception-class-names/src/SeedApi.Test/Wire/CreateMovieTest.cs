using NUnit.Framework;
using SeedApi.Test.Wire;
using SeedApi.Test.Utils;
using SeedApi.Core;

#nullable enable

namespace SeedApi.Test;

[TestFixture]
public class CreateMovieTest : BaseWireTest
{
    [Test]
    public void WireTest() {
        const string requestJson = """
        {
          "title": "string",
  "rating": 1.1
}
        """;

        const string mockResponse = """
        "string"
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/create-movie").UsingPost().WithBody(requestJson))
        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));
        var response = Client.Imdb.CreateMovieAsync(new CreateMovieRequest{ 
                Title = "string", Rating = 1.1
            }).Result;

        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

}
