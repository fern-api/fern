using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnListOfObjectsTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            [
              {
                "string": "string"
              }
            ]
            """;

        const string mockResponse = """
            [
              {
                "string": "string"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/list-of-objects")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Endpoints.Container.GetAndReturnListOfObjectsAsync(
                new List<ObjectWithRequiredField>()
                {
                    new ObjectWithRequiredField { String = "string" }
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
