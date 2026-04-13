using global::Contoso.Net;
using global::Contoso.Net.Test.Unit.MockServer;
using global::Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.System;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreatetaskTest : BaseMockServerTest
{
    [global::NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "name": "name",
              "user": {
                "line1": "line1",
                "line2": "line2",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              },
              "owner": {
                "line1": "line1",
                "line2": "line2",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              }
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "user": {
                "line1": "line1",
                "line2": "line2",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              },
              "owner": {
                "line1": "line1",
                "line2": "line2",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/tasks")
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

        var response = await Client.System.CreatetaskAsync(
            new SystemTask
            {
                Name = "name",
                User = new SystemUser
                {
                    Line1 = "line1",
                    Line2 = "line2",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = SystemUserCountry.Usa,
                },
                Owner = new SystemUser
                {
                    Line1 = "line1",
                    Line2 = "line2",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = SystemUserCountry.Usa,
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [global::NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "name": "name",
              "user": {
                "line1": "line1",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              },
              "owner": {
                "line1": "line1",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              }
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "user": {
                "line1": "line1",
                "line2": "line2",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              },
              "owner": {
                "line1": "line1",
                "line2": "line2",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/tasks")
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

        var response = await Client.System.CreatetaskAsync(
            new SystemTask
            {
                Name = "name",
                User = new SystemUser
                {
                    Line1 = "line1",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = SystemUserCountry.Usa,
                },
                Owner = new SystemUser
                {
                    Line1 = "line1",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = SystemUserCountry.Usa,
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
