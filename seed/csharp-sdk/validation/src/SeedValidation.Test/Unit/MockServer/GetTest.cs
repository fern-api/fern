using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;

namespace SeedValidation.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            {
              "decimal": 2.2,
              "even": 100,
              "name": "foo",
              "shape": "SQUARE"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("decimal", "2.2")
                    .WithParam("even", "100")
                    .WithParam("name", "foo")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetAsync(
            new GetRequest
            {
                Decimal = 2.2,
                Even = 100,
                Name = "foo",
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Type>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
