using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMixedCase.Core;
using SeedMixedCase.Test.Wire;

#nullable enable

namespace SeedMixedCase.Test;

[TestFixture]
public class GetResourceTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string mockResponse = """
            {
              "resource_type": "user",
              "userName": "username",
              "metadata_tags": [
                "tag1",
                "tag2"
              ],
              "EXTRA_PROPERTIES": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/resource/string").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetResourceAsync("string", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string mockResponse = """
            {
              "resource_type": "user",
              "userName": "username",
              "metadata_tags": [
                "tag1",
                "tag2"
              ],
              "EXTRA_PROPERTIES": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/resource/rsc-xyz").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetResourceAsync("rsc-xyz", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
