using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PatchcomplexTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        const string requestJson = """
            {
              "name": "name",
              "age": 1,
              "active": true,
              "metadata": {
                "metadata": {
                  "key": "value"
                }
              },
              "tags": [
                "tags",
                "tags"
              ],
              "email": "email",
              "nickname": "nickname",
              "bio": "bio",
              "profileImageUrl": "profileImageUrl",
              "settings": {
                "settings": {
                  "key": "value"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/complex/id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.PatchcomplexAsync(
                new ServicePatchComplexRequest
                {
                    Id = "id",
                    Name = "name",
                    Age = 1,
                    Active = true,
                    Metadata = new Dictionary<string, object?>()
                    {
                        {
                            "metadata",
                            new Dictionary<object, object?>() { { "key", "value" } }
                        },
                    },
                    Tags = new List<string>() { "tags", "tags" },
                    Email = "email",
                    Nickname = "nickname",
                    Bio = "bio",
                    ProfileImageUrl = "profileImageUrl",
                    Settings = new Dictionary<string, object?>()
                    {
                        {
                            "settings",
                            new Dictionary<object, object?>() { { "key", "value" } }
                        },
                    },
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/complex/id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.PatchcomplexAsync(new ServicePatchComplexRequest { Id = "id" })
        );
    }
}
