using NUnit.Framework;
using SeedValidation;
using SeedValidation.Test.Utils;

namespace SeedValidation.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "decimal": 2.2,
              "even": 100,
              "name": "fern",
              "shape": "SQUARE"
            }
            """;

        const string mockResponse = """
            {
              "decimal": 2.2,
              "even": 100,
              "name": "fern",
              "shape": "SQUARE"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/create")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreateAsync(
            new CreateRequest
            {
                Decimal = 2.2,
                Even = 100,
                Name = "fern",
                Shape = Shape.Square,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
