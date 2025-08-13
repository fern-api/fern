using NUnit.Framework;
using SeedApi.Core;
using WireMock.Matchers;
using WireMock.Server;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

namespace SeedApi.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class QueryParameterTests
{
    private WireMockServer _server;
    private HttpClient _httpClient;
    private RawClient _rawClient;
    private string _baseUrl;

    [SetUp]
    public void SetUp()
    {
        _server = WireMockServer.Start();
        _baseUrl = _server.Url ?? "";
        _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
        _rawClient = new RawClient(new ClientOptions { HttpClient = _httpClient });
    }

    [Test]
    public void CreateRequest_QueryParametersEscaping()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").WithParam("foo", "bar").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new JsonRequest()
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Query = new Dictionary<string, object>
            {
                { "sample", "value" },
                { "email", "bob+test@example.com" },
                { "%Complete", "100" },
            },
            Options = new RequestOptions(),
        };

        var url = _rawClient.CreateHttpRequest(request).RequestUri!.AbsoluteUri;

        Assert.That(url, Does.Contain("sample=value"));
        Assert.That(url, Does.Contain("email=bob%2Btest%40example.com"));
        Assert.That(url, Does.Contain("%25Complete=100"));
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}
