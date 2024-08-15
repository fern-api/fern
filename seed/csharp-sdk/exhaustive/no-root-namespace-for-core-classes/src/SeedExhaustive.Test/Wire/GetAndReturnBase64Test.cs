using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Wire;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnBase64Test : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            "SGVsbG8gd29ybGQh"
            """;

        const string mockResponse = """
            "SGVsbG8gd29ybGQh"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/base64")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnBase64Async(
            "SGVsbG8gd29ybGQh",
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
