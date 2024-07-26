using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedApi.Core;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Wire;

[TestFixture]
public class SampleTest
{
    private SeedApiClient _client;
    
    [SetUp]
    public void SetUp()
    {
        _client = GlobalTestSetup.Client;
    }
    
    [TearDown]
    public void TearDown()
    {
        // Reset the WireMock server after each test
        GlobalTestSetup.Server.Reset();
    }

    [Test]
    public void Test_Post_Endpoint()
    {
        const string json = """
                            {
                              "title": "Inception",
                              "rating": 8.8
                            }
                            """;

        const string mockResponse = "\"MovieId123\"";
        GlobalTestSetup.Server
            .Given(
                WireMock.RequestBuilders.Request.Create()
                    .WithHeader("X-Fern-Language", "C#")
                    .WithPath("/movies/create-movie")
                    .UsingPost()
                    .WithBody(json)
            )
            .RespondWith(
                WireMock.ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = _client.Imdb.CreateMovieAsync(new CreateMovieRequest
        {
            Rating = 8.8, Title = "Inception"
        }).Result;

        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void Test_Get_Endpoint()
    {
        const string mockResponse = """
                                        {
                                          "id": "idid",
                                          "title": "Inception",
                                          "rating": 4.8
                                        }
                                        """;
        
        GlobalTestSetup.Server
            .Given(
                WireMock.RequestBuilders.Request.Create()
                    .WithHeader("X-Fern-Language", "C#")
                    .WithPath("/movies/idid")
                    .UsingGet()
            )
            .RespondWith(
                WireMock.ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = _client.Imdb.GetMovieAsync("idid").Result;
        
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}