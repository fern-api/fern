using NUnit.Framework;
using SeedApi.Test.Wire;
using SeedApi.Test.Utils;
using SeedApi.Core;

#nullable enable

namespace SeedApi.Test;

[TestFixture]
public class GetMovieTest : BaseWireTest
{
    [Test]
    public void WireTest() {

        const string mockResponse = """
        {
          "id": "string",
  "title": "string",
  "rating": 1.1
}
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingGet())
        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));
        var response = Client.Imdb.GetMovieAsync("string").Result;

        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

}
