using global::Contoso.Net;
using global::Contoso.Net.Test.Unit.MockServer;
using global::Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.System;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateuserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "line1": "line1",
              "line2": "line2",
              "city": "city",
              "state": "state",
              "zip": "zip",
              "country": "USA"
            }
            """;

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
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.System.CreateuserAsync(
            new SystemUser
            {
                Line1 = "line1",
                Line2 = "line2",
                City = "city",
                State = "state",
                Zip = "zip",
                Country = SystemUserCountry.Usa,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "line1": "line1",
              "city": "city",
              "state": "state",
              "zip": "zip",
              "country": "USA"
            }
            """;

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
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.System.CreateuserAsync(
            new SystemUser
            {
                Line1 = "line1",
                City = "city",
                State = "state",
                Zip = "zip",
                Country = SystemUserCountry.Usa,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
