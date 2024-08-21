using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test.Unit.MockServer;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetHomepageProblemsTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              "string"
            ]
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/homepage-problems").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Homepage.GetHomepageProblemsAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
