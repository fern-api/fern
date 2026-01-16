using System;
using System.Collections.Generic;
using System.Net;
using NUnit.Framework;
using <%= namespace %>;

namespace <%= testNamespace %>.Core;

[TestFixture]
public class RawResponseTests
{
    [Test]
    public void Constructor_WithAllProperties_ShouldInitializeCorrectly()
    {
        // Arrange
        var statusCode = HttpStatusCode.OK;
        var url = new Uri("https://api.example.com/users");
        var headers = new ResponseHeaders(
            new Dictionary<string, IEnumerable<string>>
            {
                ["Content-Type"] = new[] { "application/json" }
            }
        );

        // Act
        var rawResponse = new RawResponse
        {
            StatusCode = statusCode,
            Url = url,
            Headers = headers
        };

        // Assert
        Assert.That(rawResponse.StatusCode, Is.EqualTo(statusCode));
        Assert.That(rawResponse.Url, Is.EqualTo(url));
        Assert.That(rawResponse.Headers, Is.EqualTo(headers));
    }

    [Test]
    public void StatusCode_ShouldStoreAllHttpStatusCodes()
    {
        // Arrange
        var testCases = new[]
        {
            HttpStatusCode.OK,
            HttpStatusCode.Created,
            HttpStatusCode.NoContent,
            HttpStatusCode.BadRequest,
            HttpStatusCode.Unauthorized,
            HttpStatusCode.Forbidden,
            HttpStatusCode.NotFound,
            HttpStatusCode.InternalServerError,
            HttpStatusCode.ServiceUnavailable
        };

        foreach (var statusCode in testCases)
        {
            // Act
            var rawResponse = new RawResponse
            {
                StatusCode = statusCode,
                Url = new Uri("https://example.com"),
                Headers = new ResponseHeaders(new Dictionary<string, IEnumerable<string>>())
            };

            // Assert
            Assert.That(rawResponse.StatusCode, Is.EqualTo(statusCode));
        }
    }

    [Test]
    public void Url_ShouldPreserveCompleteUri()
    {
        // Arrange
        var url = new Uri("https://api.example.com:8080/v1/users/123?include=profile&sort=name#section");

        // Act
        var rawResponse = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = url,
            Headers = new ResponseHeaders(new Dictionary<string, IEnumerable<string>>())
        };

        // Assert
        Assert.That(rawResponse.Url, Is.EqualTo(url));
        Assert.That(rawResponse.Url.Scheme, Is.EqualTo("https"));
        Assert.That(rawResponse.Url.Host, Is.EqualTo("api.example.com"));
        Assert.That(rawResponse.Url.Port, Is.EqualTo(8080));
        Assert.That(rawResponse.Url.AbsolutePath, Is.EqualTo("/v1/users/123"));
        Assert.That(rawResponse.Url.Query, Is.EqualTo("?include=profile&sort=name"));
        Assert.That(rawResponse.Url.Fragment, Is.EqualTo("#section"));
    }

    [Test]
    public void Headers_ShouldStoreCompleteHeaderCollection()
    {
        // Arrange
        var headers = new ResponseHeaders(
            new Dictionary<string, IEnumerable<string>>
            {
                ["Content-Type"] = new[] { "application/json" },
                ["Content-Length"] = new[] { "1234" },
                ["X-Request-Id"] = new[] { "req-123" },
                ["X-Rate-Limit-Remaining"] = new[] { "99" }
            }
        );

        // Act
        var rawResponse = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://example.com"),
            Headers = headers
        };

        // Assert
        Assert.That(rawResponse.Headers.Contains("Content-Type"), Is.True);
        Assert.That(rawResponse.Headers.Contains("Content-Length"), Is.True);
        Assert.That(rawResponse.Headers.Contains("X-Request-Id"), Is.True);
        Assert.That(rawResponse.Headers.Contains("X-Rate-Limit-Remaining"), Is.True);
    }

    [Test]
    public void RecordEquality_WithSameValues_ShouldBeEqual()
    {
        // Arrange
        var headers = new ResponseHeaders(
            new Dictionary<string, IEnumerable<string>>
            {
                ["Content-Type"] = new[] { "application/json" }
            }
        );

        var response1 = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://example.com"),
            Headers = headers
        };

        var response2 = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://example.com"),
            Headers = headers
        };

        // Act & Assert
        Assert.That(response1.StatusCode, Is.EqualTo(response2.StatusCode));
        Assert.That(response1.Url, Is.EqualTo(response2.Url));
        Assert.That(response1.Headers, Is.EqualTo(response2.Headers));
    }

    [Test]
    public void RecordEquality_WithDifferentStatusCode_ShouldNotBeEqual()
    {
        // Arrange
        var headers = new ResponseHeaders(new Dictionary<string, IEnumerable<string>>());

        var response1 = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://example.com"),
            Headers = headers
        };

        var response2 = new RawResponse
        {
            StatusCode = HttpStatusCode.Created,
            Url = new Uri("https://example.com"),
            Headers = headers
        };

        // Act & Assert
        Assert.That(response1.StatusCode, Is.Not.EqualTo(response2.StatusCode));
    }

    [Test]
    public void RecordEquality_WithDifferentUrl_ShouldNotBeEqual()
    {
        // Arrange
        var headers = new ResponseHeaders(new Dictionary<string, IEnumerable<string>>());

        var response1 = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://example.com/path1"),
            Headers = headers
        };

        var response2 = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://example.com/path2"),
            Headers = headers
        };

        // Act & Assert
        Assert.That(response1.Url, Is.Not.EqualTo(response2.Url));
    }

    [Test]
    public void ToString_ShouldIncludeKeyProperties()
    {
        // Arrange
        var rawResponse = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://api.example.com/users"),
            Headers = new ResponseHeaders(
                new Dictionary<string, IEnumerable<string>>
                {
                    ["Content-Type"] = new[] { "application/json" }
                }
            )
        };

        // Act
        var result = rawResponse.ToString();

        // Assert
        Assert.That(result, Does.Contain("OK"));
        Assert.That(result, Does.Contain("https://api.example.com/users"));
    }
}
