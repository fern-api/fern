using NUnit.Framework;
using SeedPagination;
using SeedPagination.Core;
using SeedPagination.Test.Utils;
using SeedPagination.Test.Wire;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListWithGlobalConfigTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            {
              "results": [
                "string"
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Users.ListWithGlobalConfigAsync(new ListWithGlobalConfigRequest { Offset = 1 })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
