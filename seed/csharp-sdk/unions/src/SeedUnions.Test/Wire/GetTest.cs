using NUnit.Framework;
using SeedUnions.Core;
using SeedUnions.Test.Utils;
using SeedUnions.Test.Wire;

#nullable enable

namespace SeedUnions.Test;

[TestFixture]
public class GetTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            {
              "type": "circle",
              "id": "string",
              "radius": 1.1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/string").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Union.GetAsync("string").Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
