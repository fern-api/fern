using System.Globalization;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Wire;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnDatetimeTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            "2024-01-15T09:30:00Z"
            """;

        const string mockResponse = """
            "2024-01-15T09:30:00Z"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/datetime")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnDatetimeAsync(
            DateTime.Parse("2024-01-15T09:30:00.000Z", null, DateTimeStyles.AdjustToUniversal),
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
