using NUnit.Framework;
using SeedPagination.Test.Wire;
using SeedPagination;
using SeedPagination.Test.Utils;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListWithExtendedResultsTest : BaseWireTest
{
    [Test]
    public void WireTest() {

        const string mockResponse = """
        {
          "total_count": 1,
          "data": {
            "users": [
              {}
            ]
          },
          "next": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").WithParam("cursor", "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = Client.Users.ListWithExtendedResultsAsync(new ListUsersExtendedRequest{ 
                Cursor = d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32
            }).Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

}
