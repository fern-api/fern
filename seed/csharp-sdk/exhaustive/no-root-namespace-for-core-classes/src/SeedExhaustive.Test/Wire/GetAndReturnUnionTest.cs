using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using System.Threading.Tasks;
using SeedExhaustive.Types;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnUnionTest : BaseWireTest
{
    [Test]
    public async Task WireTest() {
        const string requestJson = """
        {
          "animal": "dog",
          "name": "string",
          "likesToWoof": true
        }
        """;

        const string mockResponse = """
        {
          "animal": "dog",
          "name": "string",
          "likesToWoof": true
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/union").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Union.GetAndReturnUnionAsync(new Dognew Dog{ 
                Name = "string", LikesToWoof = true
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
