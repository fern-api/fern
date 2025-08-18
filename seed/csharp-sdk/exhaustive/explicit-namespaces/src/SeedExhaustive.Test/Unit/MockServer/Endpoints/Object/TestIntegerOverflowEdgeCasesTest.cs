using System.Globalization;
using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[NUnit.Framework.TestFixture]
public class TestIntegerOverflowEdgeCasesTest
    : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "string": "string",
              "integer": 1,
              "long": 1000000,
              "double": 1.1,
              "bool": true,
              "datetime": "2024-01-15T09:30:00.000Z",
              "date": "2023-01-15",
              "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
              "base64": "SGVsbG8gd29ybGQh",
              "list": [
                "list",
                "list"
              ],
              "set": [
                "set"
              ],
              "map": {
                "1": "map"
              },
              "bigint": "1000000"
            }
            """;

        const string mockResponse = """
            {
              "string": "string",
              "integer": 1,
              "long": 1000000,
              "double": 1.1,
              "bool": true,
              "datetime": "2024-01-15T09:30:00.000Z",
              "date": "2023-01-15",
              "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
              "base64": "SGVsbG8gd29ybGQh",
              "list": [
                "list",
                "list"
              ],
              "set": [
                "set"
              ],
              "map": {
                "1": "map"
              },
              "bigint": "1000000"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/test-integer-overflow-edge-cases")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new SeedExhaustive.Types.Object.ObjectWithOptionalField
            {
                String = "string",
                Integer = 1,
                Long = 1000000,
                Double = 1.1,
                Bool = true,
                Datetime = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    System.Globalization.DateTimeStyles.AdjustToUniversal
                ),
                Date = new DateOnly(2023, 1, 15),
                Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                Base64 = "SGVsbG8gd29ybGQh",
                List = new List<string>() { "list", "list" },
                Set = new HashSet<string>() { "set" },
                Map = new Dictionary<int, string>() { { 1, "map" } },
                Bigint = "1000000",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "string": "boundary-test",
              "integer": 2147483647,
              "long": 9223372036854776000,
              "double": 1.7976931348623157e+308,
              "bool": true
            }
            """;

        const string mockResponse = """
            {
              "string": "boundary-test",
              "integer": 2147483647,
              "long": 9223372036854776000,
              "double": 1.7976931348623157e+308,
              "bool": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/test-integer-overflow-edge-cases")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new SeedExhaustive.Types.Object.ObjectWithOptionalField
            {
                String = "boundary-test",
                Integer = 2147483647,
                Long = 9223372036854776000,
                Double = 1.7976931348623157e+308,
                Bool = true,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_3()
    {
        const string requestJson = """
            {
              "string": "just-over-boundary",
              "integer": 2147483648,
              "long": 2147483648,
              "double": 2,
              "bool": false
            }
            """;

        const string mockResponse = """
            {
              "string": "just-over-boundary",
              "integer": 2147483648,
              "long": 2147483648,
              "double": 2,
              "bool": false
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/test-integer-overflow-edge-cases")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new SeedExhaustive.Types.Object.ObjectWithOptionalField
            {
                String = "just-over-boundary",
                Integer = 2147483648,
                Long = 2147483648,
                Double = 2,
                Bool = false,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_4()
    {
        const string requestJson = """
            {
              "string": "just-under-boundary",
              "integer": -2147483649,
              "long": -2147483649,
              "double": -2,
              "bool": true
            }
            """;

        const string mockResponse = """
            {
              "string": "just-under-boundary",
              "integer": -2147483649,
              "long": -2147483649,
              "double": -2,
              "bool": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/test-integer-overflow-edge-cases")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new SeedExhaustive.Types.Object.ObjectWithOptionalField
            {
                String = "just-under-boundary",
                Integer = -2147483649,
                Long = -2147483649,
                Double = -2,
                Bool = true,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_5()
    {
        const string requestJson = """
            {
              "string": "large-positive",
              "integer": 1000000000000,
              "long": 1000000000000,
              "double": 1000000000000,
              "bool": false
            }
            """;

        const string mockResponse = """
            {
              "string": "large-positive",
              "integer": 1000000000000,
              "long": 1000000000000,
              "double": 1000000000000,
              "bool": false
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/test-integer-overflow-edge-cases")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new SeedExhaustive.Types.Object.ObjectWithOptionalField
            {
                String = "large-positive",
                Integer = 1000000000000,
                Long = 1000000000000,
                Double = 1000000000000,
                Bool = false,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_6()
    {
        const string requestJson = """
            {
              "string": "large-negative",
              "integer": -1000000000000,
              "long": -1000000000000,
              "double": -1000000000000,
              "bool": true
            }
            """;

        const string mockResponse = """
            {
              "string": "large-negative",
              "integer": -1000000000000,
              "long": -1000000000000,
              "double": -1000000000000,
              "bool": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/test-integer-overflow-edge-cases")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new SeedExhaustive.Types.Object.ObjectWithOptionalField
            {
                String = "large-negative",
                Integer = -1000000000000,
                Long = -1000000000000,
                Double = -1000000000000,
                Bool = true,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithOptionalField>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }
}
