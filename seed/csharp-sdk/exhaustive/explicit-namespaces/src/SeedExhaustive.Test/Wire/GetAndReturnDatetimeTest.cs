using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Test.Wire;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnDatetimeTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Endpoints.Primitive.GetAndReturnDatetimeAsync(
                new DateTime(2024, 01, 15, 04, 30, 00, 000)
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
