using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Conversations;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class OutboundCallTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "to_phone_number": "to_phone_number"
            }
            """;

        const string mockResponse = """
            {
              "conversation_id": {
                "key": "value"
              },
              "dry_run": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/conversations/outbound-call")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Conversations.OutboundCallAsync(
            new OutboundCallConversationsRequest { ToPhoneNumber = "to_phone_number" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
