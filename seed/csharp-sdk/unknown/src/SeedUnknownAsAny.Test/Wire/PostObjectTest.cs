using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Core;
using SeedUnknownAsAny.Test.Wire;

#nullable enable

namespace SeedUnknownAsAny.Test;

[TestFixture]
public class PostObjectTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            [
              {
                "key": "value"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/with-object")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Unknown.PostObjectAsync(new MyObject(), RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
