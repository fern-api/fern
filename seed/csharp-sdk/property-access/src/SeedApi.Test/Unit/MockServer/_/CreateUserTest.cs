using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "id": "id",
              "email": "email",
              "password": "password",
              "profile": {
                "name": "name",
                "verification": {
                  "verified": "verified"
                },
                "ssn": "ssn"
              }
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "email": "email",
              "password": "password",
              "profile": {
                "name": "name",
                "verification": {
                  "verified": "verified"
                },
                "ssn": "ssn"
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

        var response = await Client._.CreateUserAsync(
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
              "id": "id",
              "email": "email",
              "password": "password",
              "profile": {
                "name": "name",
                "verification": {
                  "verified": "verified"
                },
                "ssn": "ssn"
              }
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "email": "email",
              "password": "password",
              "profile": {
                "name": "name",
                "verification": {
                  "verified": "verified"
                },
                "ssn": "ssn"
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

        var response = await Client._.CreateUserAsync(
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
}
