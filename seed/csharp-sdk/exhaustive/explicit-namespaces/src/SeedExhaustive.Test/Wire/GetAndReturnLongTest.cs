using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Test.Wire;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnLongTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            1000000
            """;

        const string mockResponse = """
            1000000
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/long")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Endpoints.Primitive.GetAndReturnLongAsync(1000000).Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
