using NUnit.Framework;
using SeedUndiscriminatedUnions.Core;
using SeedUndiscriminatedUnions.Test.Utils;
using SeedUndiscriminatedUnions.Test.Wire;

#nullable enable

namespace SeedUndiscriminatedUnions.Test;

[TestFixture]
public class GetMetadataTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
    {
        const string mockResponse = """
            {
              "name": "exampleName",
              "value": "exampleValue",
              "default": "exampleDefault"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/metadata").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Union.GetMetadataAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
    {
        const string mockResponse = """
            {
              "name": "exampleName",
              "value": "exampleValue",
              "default": "exampleDefault"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("//metadata").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Union.GetMetadataAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
