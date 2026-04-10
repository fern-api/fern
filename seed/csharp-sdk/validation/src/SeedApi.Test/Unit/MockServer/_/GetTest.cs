using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
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
                    .WithPath("/")
                    .WithParam("decimal", "1.1")
                    .WithParam("even", "1")
                    .WithParam("name", "name")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.GetAsync(
            new GetRequest
            {
                Decimal = 1.1,
                Even = 1,
                Name = "name",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
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
                    .WithPath("/")
                    .WithParam("decimal", "1.1")
                    .WithParam("even", "1")
                    .WithParam("name", "name")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.GetAsync(
            new GetRequest
            {
                Decimal = 1.1,
                Even = 1,
                Name = "name",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
