using NUnit.Framework;

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
    public void Test_Get_Endpoint1()
    {
        var json = """
                                   {
                                     "title": "Inception",
                                     "rating": 8.8
                                   }
                                   """;

        GlobalTestSetup.Server
            .Given(
                WireMock.RequestBuilders.Request.Create()
                    .WithPath("/movies/create-movie")
                    .UsingPost()
                    .WithBody(json)
            )
            .RespondWith(
                WireMock.ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody("\"MovieId123\"")
            );

        var response = _client.Imdb.CreateMovieAsync(new CreateMovieRequest
        {
            Rating = 8.8, Title = "Inception"
        }).Result;

        // Assert.That(responseString, Is.EqualTo("expected content 1"));
    }

    [Test]
    public void Test_Get_Endpoint2()
    {
        var expectedResponse = """
                       {
                         "id": "12345",
                         "title": "Inception",
                         "rating": 4.8
                       }
                       """;
        GlobalTestSetup.Server
            .Given(
                WireMock.RequestBuilders.Request.Create()
                    .WithPath("/movie/idid")
                    .UsingGet()
            )
            .RespondWith(
                WireMock.ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(expectedResponse)
            );

        var response = _client.Imdb.GetMovieAsync("idid").Result;
        // Assert.That(responseString, Is.EqualTo("expected content 1"));
    }
}