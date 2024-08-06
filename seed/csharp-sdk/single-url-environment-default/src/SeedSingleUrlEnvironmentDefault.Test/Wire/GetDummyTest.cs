using NUnit.Framework;
using SeedSingleUrlEnvironmentDefault.Core;
using SeedSingleUrlEnvironmentDefault.Test.Utils;
using SeedSingleUrlEnvironmentDefault.Test.Wire;

#nullable enable

namespace SeedSingleUrlEnvironmentDefault.Test;

[TestFixture]
public class GetDummyTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/dummy").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Dummy.GetDummyAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
