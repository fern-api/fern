using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateProfileIdentifierTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "idType": "phone",
              "oldValue": "+13175556789",
              "newValue": "+13175556798"
            }
            """;

        const string mockResponse = """
            {
              "message": "ok"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/Profiles/profile_123/Identifiers/email")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.UpdateProfileIdentifierAsync(
            new IdentifierUpdate
            {
                ProfileId = "profile_123",
                IdTypePathParam = "email",
                IdType = "phone",
                OldValue = "+13175556789",
                NewValue = "+13175556798",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
