using System;
using System.Net.Http;
using FluentAssertions;
using NUnit.Framework;
using SeedSingleUrlEnvironmentNoDefault.Core;
using WireMock.Server;
using Request = WireMock.RequestBuilders.Request;
using Response = WireMock.ResponseBuilders.Response;
using SystemTask = System.Threading.Tasks.Task;

namespace SeedSingleUrlEnvironmentNoDefault.Test.Core
{
    [TestFixture]
    public class RawClientTests
    {
        private WireMockServer _server;
        private HttpClient _httpClient;
        private RawClient _rawClient;
        private int _maxRetries = 3;

        [SetUp]
        public void SetUp()
        {
            _server = WireMockServer.Start();
            _httpClient = new HttpClient { BaseAddress = new Uri(_server.Url) };
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
                .Given(Request.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WillSetStateTo("Server Error")
                .RespondWith(Response.Create().WithStatusCode(statusCode));

            _server
                .Given(Request.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WhenStateIs("Server Error")
                .WillSetStateTo("Success")
                .RespondWith(Response.Create().WithStatusCode(statusCode));

            _server
                .Given(Request.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WhenStateIs("Success")
                .RespondWith(Response.Create().WithStatusCode(200).WithBody("Success"));

            var request = new RawClient.BaseApiRequest
            {
                BaseUrl = _server.Url,
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
                .Given(Request.Create().WithPath("/test").UsingGet())
                .InScenario("Retry")
                .WillSetStateTo("Server Error")
                .RespondWith(Response.Create().WithStatusCode(statusCode).WithBody("Failure"));

            var request = new RawClient.BaseApiRequest
            {
                BaseUrl = _server.Url,
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
            _server?.Dispose();
            _httpClient?.Dispose();
        }
    }
}
