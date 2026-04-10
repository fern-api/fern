using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateuserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "_type": "CreateUserRequest",
              "_version": "v1",
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
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

        var response = await Client.User.CreateuserAsync(
            new UserCreateUserRequest
            {
                Type = UserCreateUserRequestType.CreateUserRequest,
                Version = UserCreateUserRequestVersion.V1,
                Name = "name",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "_type": "CreateUserRequest",
              "_version": "v1",
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
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

        var response = await Client.User.CreateuserAsync(
            new UserCreateUserRequest
            {
                Type = UserCreateUserRequestType.CreateUserRequest,
                Version = UserCreateUserRequestVersion.V1,
                Name = "name",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
