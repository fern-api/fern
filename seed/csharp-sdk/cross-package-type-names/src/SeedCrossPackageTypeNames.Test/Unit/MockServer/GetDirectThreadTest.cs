using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.Test.Unit.MockServer;

[TestFixture]
public class GetDirectThreadTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            {
              "foo": {
                "foo": {
                  "bar_property": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                }
              }
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.FolderD.Service.GetDirectThreadAsync(RequestOptions);
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<FolderD.Response>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
