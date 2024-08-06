using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;
using SeedMixedCase.Test.Utils;
using SeedMixedCase.Test.Wire;

#nullable enable

namespace SeedMixedCase.Test;

[TestFixture]
public class ListResourcesTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
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
                    .WithParam("beforeDate", "2023-01-15")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Service.ListResourcesAsync(
                new ListResourcesRequest { PageLimit = 1, BeforeDate = new DateOnly(2023, 1, 14) }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
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
                    .WithParam("beforeDate", "2023-01-01")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Service.ListResourcesAsync(
                new ListResourcesRequest { PageLimit = 10, BeforeDate = new DateOnly(2022, 12, 31) }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
