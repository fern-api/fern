using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;
using SeedValidation.Test.Utils;
using SeedValidation.Test.Wire;

#nullable enable

namespace SeedValidation.Test;

[TestFixture]
public class GetTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("name", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .GetAsync(
                new GetRequest
                {
                    Decimal = 1.1,
                    Even = 1,
                    Name = "string"
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
