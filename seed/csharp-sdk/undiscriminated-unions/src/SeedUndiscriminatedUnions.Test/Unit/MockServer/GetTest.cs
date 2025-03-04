using global::System.Threading.Tasks;
using NUnit.Framework;
using OneOf;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            "string"
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetAsync("string", RequestOptions);
        Assert.That(
            response.Value,
            Is.EqualTo(
                    JsonUtils
                        .Deserialize<
                            OneOf<
                                string,
                                IEnumerable<string>,
                                int,
                                IEnumerable<int>,
                                IEnumerable<IEnumerable<int>>,
                                HashSet<string>
                            >
                        >(mockResponse)
                        .Value
                )
                .UsingPropertiesComparer()
        );
    }
}
