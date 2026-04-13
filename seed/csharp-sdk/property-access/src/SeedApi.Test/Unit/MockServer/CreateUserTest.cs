using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "password": "password",
              "profile": {
                "name": "name",
                "verification": {},
                "ssn": "ssn"
              }
            }
            """;

        const string mockResponse = """
            {
              "profile": {
                "name": "name",
                "verification": {}
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
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

        var response = await Client.CreateUserAsync(
            new User
            {
                Id = "id",
                Email = "email",
                Password = "password",
                Profile = new UserProfile
                {
                    Name = "name",
                    Verification = new UserProfileVerification { Verified = "verified" },
                    Ssn = "ssn",
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "password": "password",
              "profile": {
                "name": "name",
                "verification": {},
                "ssn": "ssn"
              }
            }
            """;

        const string mockResponse = """
            {
              "profile": {
                "name": "name",
                "verification": {}
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
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

        var response = await Client.CreateUserAsync(
            new User
            {
                Password = "password",
                Profile = new UserProfile
                {
                    Name = "name",
                    Verification = new UserProfileVerification(),
                    Ssn = "ssn",
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
