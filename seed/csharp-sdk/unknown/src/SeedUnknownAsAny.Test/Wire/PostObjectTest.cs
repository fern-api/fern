using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Test.Wire;

#nullable enable

namespace SeedUnknownAsAny.Test;

[TestFixture]
public class PostObjectTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Unknown.PostObjectAsync(new MyObject()).Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
