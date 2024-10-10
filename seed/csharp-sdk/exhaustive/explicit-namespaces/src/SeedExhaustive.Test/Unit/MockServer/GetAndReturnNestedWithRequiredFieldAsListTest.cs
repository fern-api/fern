using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnNestedWithRequiredFieldAsListTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            [
              {
                "string": "string",
                "NestedObject": {}
              },
              {
                "string": "string",
                "NestedObject": {}
              }
            ]
            """;

        const string mockResponse = """
            {
              "string": "string",
              "NestedObject": {}
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-nested-with-required-field-list")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
            new List<NestedObjectWithRequiredField>()
            {
                new NestedObjectWithRequiredField
                {
                    String = "string",
                    NestedObject = new ObjectWithOptionalField
                    {
                        String = null,
                        Integer = null,
                        Long = null,
                        Double = null,
                        Bool = null,
                        Datetime = null,
                        Date = null,
                        Uuid = null,
                        Base64 = null,
                        List = null,
                        Set = null,
                        Map = null,
                        Bigint = null,
                    },
                },
                new NestedObjectWithRequiredField
                {
                    String = "string",
                    NestedObject = new ObjectWithOptionalField
                    {
                        String = null,
                        Integer = null,
                        Long = null,
                        Double = null,
                        Bool = null,
                        Datetime = null,
                        Date = null,
                        Uuid = null,
                        Base64 = null,
                        List = null,
                        Set = null,
                        Map = null,
                        Bigint = null,
                    },
                },
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
