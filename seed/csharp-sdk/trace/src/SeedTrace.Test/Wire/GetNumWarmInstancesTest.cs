using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetNumWarmInstancesTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "string": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/sysprop/num-warm-instances")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Sysprop.GetNumWarmInstancesAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
