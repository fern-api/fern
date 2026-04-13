using Contoso.Net.System;
using Contoso.Net.Test.Unit.MockServer;
using Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.System;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetuserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "line1": "line1",
              "line2": "line2",
              "city": "city",
              "state": "state",
              "zip": "zip",
              "country": "USA"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/userId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.System.GetuserAsync(
            new SystemGetUserRequest { UserId = "userId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "line1": "line1",
              "line2": "line2",
              "city": "city",
              "state": "state",
              "zip": "zip",
              "country": "USA"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/userId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.System.GetuserAsync(
            new SystemGetUserRequest { UserId = "userId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
