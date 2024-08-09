using NUnit.Framework;
using SeedErrorProperty.Core;
using SeedErrorProperty.Test.Utils;
using SeedErrorProperty.Test.Wire;

#nullable enable

namespace SeedErrorProperty.Test;

[TestFixture]
public class ThrowErrorTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/property-based-error")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.PropertyBasedError.ThrowErrorAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
