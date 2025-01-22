using System;
using System.Net.Http;
using FluentAssertions;
using NUnit.Framework;
using SeedOauthClientCredentials.Core;
using WireMock.Server;
using SystemTask = System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

namespace SeedOauthClientCredentials.Test.Core
{
    [TestFixture]
    public class RawClientTests
    {
        private WireMockServer _server;
        private HttpClient _httpClient;
        private RawClient _rawClient;
        private string _baseUrl;
        private const int _maxRetries = 3;

        [SetUp]
        public void SetUp()
        {
            _server = WireMockServer.Start();
            _baseUrl = _server.Url ?? "";
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _rawClient = new RawClient(
                new ClientOptions() { HttpClient = _httpClient, MaxRetries = _maxRetries }
            );
        }

        [Test]
        [TestCase(408)]
        [TestCase(429)]
        [TestCase(500)]
        [TestCase(504)]
        public async SystemTask MakeRequestAsync_ShouldRetry_OnRetryableStatusCodes(int statusCode)
        {
            _server
                .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WillSetStateTo("Server Error")
                .RespondWith(WireMockResponse.Create().WithStatusCode(statusCode));

            _server
                .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WhenStateIs("Server Error")
                .WillSetStateTo("Success")
                .RespondWith(WireMockResponse.Create().WithStatusCode(statusCode));

            _server
                .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WhenStateIs("Success")
                .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

            var request = new RawClient.BaseApiRequest
            {
                BaseUrl = _baseUrl,
                Method = HttpMethod.Get,
                Path = "/test",
            };

            var response = await _rawClient.MakeRequestAsync(request);
            Assert.That(response.StatusCode, Is.EqualTo(200));

            var content = await response.Raw.Content.ReadAsStringAsync();
            Assert.That(content, Is.EqualTo("Success"));

            Assert.That(_server.LogEntries.Count, Is.EqualTo(_maxRetries));
        }

        [Test]
        [TestCase(400)]
        [TestCase(409)]
        public async SystemTask MakeRequestAsync_ShouldRetry_OnNonRetryableStatusCodes(
            int statusCode
        )
        {
            _server
                .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WillSetStateTo("Server Error")
                .RespondWith(
                    WireMockResponse.Create().WithStatusCode(statusCode).WithBody("Failure")
                );

            var request = new RawClient.BaseApiRequest
            {
                BaseUrl = _baseUrl,
                Method = HttpMethod.Get,
                Path = "/test",
            };

            var response = await _rawClient.MakeRequestAsync(request);
            Assert.That(response.StatusCode, Is.EqualTo(statusCode));

            var content = await response.Raw.Content.ReadAsStringAsync();
            Assert.That(content, Is.EqualTo("Failure"));

            Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
        }

        [TearDown]
        public void TearDown()
        {
            _server.Dispose();
            _httpClient.Dispose();
        }
    }
}
