using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedSingleUrlEnvironmentNoDefault.Test.Wire;

#nullable enable

namespace SeedSingleUrlEnvironmentNoDefault.Test;

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
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
