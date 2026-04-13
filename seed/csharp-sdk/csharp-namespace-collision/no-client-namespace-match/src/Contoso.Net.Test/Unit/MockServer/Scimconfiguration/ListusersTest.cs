using Contoso.Net.Test.Unit.MockServer;
using Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.Scimconfiguration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListusersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "email": "email",
                "password": "password"
              },
              {
                "id": "id",
                "name": "name",
                "email": "email",
                "password": "password"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/scim-configuration/users")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Scimconfiguration.ListusersAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "email": "email",
                "password": "password"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/scim-configuration/users")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Scimconfiguration.ListusersAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
