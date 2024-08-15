using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;
using SeedMixedCase.Test.Wire;

#nullable enable

namespace SeedMixedCase.Test;

[TestFixture]
public class ListResourcesTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string mockResponse = """
            [
              {
                "resource_type": "user",
                "userName": "username",
                "metadata_tags": [
                  "tag1",
                  "tag2"
                ],
                "EXTRA_PROPERTIES": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/resource")
                    .WithParam("page_limit", "1")
                    .WithParam("beforeDate", "2023-01-15")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListResourcesAsync(
            new ListResourcesRequest { PageLimit = 1, BeforeDate = new DateOnly(2023, 1, 15) },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string mockResponse = """
            [
              {
                "resource_type": "user",
                "userName": "username",
                "metadata_tags": [
                  "tag1",
                  "tag2"
                ],
                "EXTRA_PROPERTIES": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/resource")
                    .WithParam("page_limit", "10")
                    .WithParam("beforeDate", "2023-01-01")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListResourcesAsync(
            new ListResourcesRequest { PageLimit = 10, BeforeDate = new DateOnly(2023, 1, 1) },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
