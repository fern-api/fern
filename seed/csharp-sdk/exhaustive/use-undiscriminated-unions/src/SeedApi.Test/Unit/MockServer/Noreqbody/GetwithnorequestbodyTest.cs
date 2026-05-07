using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Noreqbody;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetwithnorequestbodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "string": "string",
              "integer": 1,
              "long": 1000000,
              "double": 1.1,
              "bool": true,
              "datetime": "2024-01-15T09:30:00.000Z",
              "date": "2023-01-15",
              "uuid": "uuid",
              "base64": "base64",
              "list": [
                "list",
                "list"
              ],
              "set": [
                "set",
                "set"
              ],
              "map": {
                "map": "map"
              },
              "bigint": 1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/no-req-body").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Noreqbody.GetwithnorequestbodyAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "string": "string",
              "integer": 1,
              "long": 1000000,
              "double": 1.1,
              "bool": true,
              "datetime": "2024-01-15T09:30:00.000Z",
              "date": "2023-01-15",
              "uuid": "uuid",
              "base64": "base64",
              "list": [
                "list"
              ],
              "set": [
                "set"
              ],
              "map": {
                "key": "value"
              },
              "bigint": 1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/no-req-body").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Noreqbody.GetwithnorequestbodyAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
