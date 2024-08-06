using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test.Utils;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class PingTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/ping").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Health.Service.PingAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("//ping").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Health.Service.PingAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
