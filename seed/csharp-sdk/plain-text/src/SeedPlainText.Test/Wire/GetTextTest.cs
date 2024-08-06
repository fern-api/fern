using NUnit.Framework;
using SeedPlainText.Core;
using SeedPlainText.Test.Utils;
using SeedPlainText.Test.Wire;

#nullable enable

namespace SeedPlainText.Test;

[TestFixture]
public class GetTextTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/text").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.GetTextAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
