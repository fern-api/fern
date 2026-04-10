using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "decimal": 1.1,
              "even": 1,
              "name": "name",
              "shape": "SQUARE"
            }
            """;

        const string mockResponse = """
            {
              "decimal": 1.1,
              "even": 1,
              "name": "name",
              "shape": "SQUARE"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/create")
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

        var response = await Client._.CreateAsync(
            new CreateRequest
            {
                Decimal = 1.1,
                Even = 1,
                Name = "name",
                Shape = Shape.Square,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "decimal": 1.1,
              "even": 1,
              "name": "name",
              "shape": "SQUARE"
            }
            """;

        const string mockResponse = """
            {
              "decimal": 1.1,
              "even": 1,
              "name": "name",
              "shape": "SQUARE"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/create")
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

        var response = await Client._.CreateAsync(
            new CreateRequest
            {
                Decimal = 1.1,
                Even = 1,
                Name = "name",
                Shape = Shape.Square,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
