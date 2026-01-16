using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using NUnit.Framework;
using <%= namespace %>;

namespace <%= testNamespace %>.Core;

[TestFixture]
public class ResponseHeadersTests
{
    [Test]
    public void Constructor_WithKeyValuePairs_ShouldInitializeHeaders()
    {
        // Arrange
        var headers = new List<KeyValuePair<string, IEnumerable<string>>>
        {
            new("Content-Type", new[] { "application/json" }),
            new("X-Custom-Header", new[] { "value1", "value2" })
        };

        // Act
        var responseHeaders = new ResponseHeaders(headers);

        // Assert
        Assert.That(responseHeaders.Contains("Content-Type"), Is.True);
        Assert.That(responseHeaders.Contains("X-Custom-Header"), Is.True);
    }

    [Test]
    public void Constructor_WithDictionary_ShouldInitializeHeaders()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Content-Type"] = new[] { "application/json" },
            ["Content-Length"] = new[] { "1234" }
        };

        // Act
        var responseHeaders = new ResponseHeaders(headers);

        // Assert
        Assert.That(responseHeaders.Contains("Content-Type"), Is.True);
        Assert.That(responseHeaders.Contains("Content-Length"), Is.True);
    }

    [Test]
    public void HeaderLookup_ShouldBeCaseInsensitive()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Content-Type"] = new[] { "application/json" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act & Assert
        Assert.That(responseHeaders.Contains("content-type"), Is.True);
        Assert.That(responseHeaders.Contains("CONTENT-TYPE"), Is.True);
        Assert.That(responseHeaders.Contains("Content-Type"), Is.True);
    }

    [Test]
    public void TryGetValue_WhenHeaderExists_ShouldReturnTrueAndValue()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Content-Type"] = new[] { "application/json" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var result = responseHeaders.TryGetValue("Content-Type", out var value);

        // Assert
        Assert.That(result, Is.True);
        Assert.That(value, Is.EqualTo("application/json"));
    }

    [Test]
    public void TryGetValue_WhenHeaderHasMultipleValues_ShouldJoinWithComma()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Accept"] = new[] { "application/json", "text/html", "application/xml" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var result = responseHeaders.TryGetValue("Accept", out var value);

        // Assert
        Assert.That(result, Is.True);
        Assert.That(value, Is.EqualTo("application/json, text/html, application/xml"));
    }

    [Test]
    public void TryGetValue_WhenHeaderDoesNotExist_ShouldReturnFalseAndNull()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>();
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var result = responseHeaders.TryGetValue("X-Missing-Header", out var value);

        // Assert
        Assert.That(result, Is.False);
        Assert.That(value, Is.Null);
    }

    [Test]
    public void TryGetValues_WhenHeaderExists_ShouldReturnTrueAndValues()
    {
        // Arrange
        var expectedValues = new[] { "value1", "value2", "value3" };
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["X-Custom-Header"] = expectedValues
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var result = responseHeaders.TryGetValues("X-Custom-Header", out var values);

        // Assert
        Assert.That(result, Is.True);
        Assert.That(values, Is.EqualTo(expectedValues));
    }

    [Test]
    public void TryGetValues_WhenHeaderDoesNotExist_ShouldReturnFalseAndNull()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>();
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var result = responseHeaders.TryGetValues("X-Missing-Header", out var values);

        // Assert
        Assert.That(result, Is.False);
        Assert.That(values, Is.Null);
    }

    [Test]
    public void Contains_WhenHeaderExists_ShouldReturnTrue()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Authorization"] = new[] { "Bearer token123" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act & Assert
        Assert.That(responseHeaders.Contains("Authorization"), Is.True);
        Assert.That(responseHeaders.Contains("authorization"), Is.True); // Case insensitive
    }

    [Test]
    public void Contains_WhenHeaderDoesNotExist_ShouldReturnFalse()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>();
        var responseHeaders = new ResponseHeaders(headers);

        // Act & Assert
        Assert.That(responseHeaders.Contains("X-Missing-Header"), Is.False);
    }

    [Test]
    public void ContentType_WhenPresent_ShouldReturnValue()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Content-Type"] = new[] { "application/json; charset=utf-8" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var contentType = responseHeaders.ContentType;

        // Assert
        Assert.That(contentType, Is.EqualTo("application/json; charset=utf-8"));
    }

    [Test]
    public void ContentType_WhenAbsent_ShouldReturnNull()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>();
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var contentType = responseHeaders.ContentType;

        // Assert
        Assert.That(contentType, Is.Null);
    }

    [Test]
    public void ContentLength_WhenPresent_ShouldReturnParsedValue()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Content-Length"] = new[] { "12345" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var contentLength = responseHeaders.ContentLength;

        // Assert
        Assert.That(contentLength, Is.EqualTo(12345L));
    }

    [Test]
    public void ContentLength_WhenAbsent_ShouldReturnNull()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>();
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var contentLength = responseHeaders.ContentLength;

        // Assert
        Assert.That(contentLength, Is.Null);
    }

    [Test]
    public void ContentLength_WhenInvalidFormat_ShouldReturnNull()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Content-Length"] = new[] { "not-a-number" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var contentLength = responseHeaders.ContentLength;

        // Assert
        Assert.That(contentLength, Is.Null);
    }

    [Test]
    public void GetEnumerator_ShouldIterateOverHeaders()
    {
        // Arrange
        var headers = new Dictionary<string, IEnumerable<string>>
        {
            ["Content-Type"] = new[] { "application/json" },
            ["Content-Length"] = new[] { "100" },
            ["X-Custom"] = new[] { "value1", "value2" }
        };
        var responseHeaders = new ResponseHeaders(headers);

        // Act
        var headerList = responseHeaders.ToList();

        // Assert
        Assert.That(headerList, Has.Count.EqualTo(3));
        Assert.That(headerList.Any(h => h.Name == "Content-Type" && h.Value == "application/json"), Is.True);
        Assert.That(headerList.Any(h => h.Name == "Content-Length" && h.Value == "100"), Is.True);
        Assert.That(headerList.Any(h => h.Name == "X-Custom" && h.Value == "value1, value2"), Is.True);
    }

    [Test]
    public void FromHttpResponseMessage_ShouldExtractResponseHeaders()
    {
        // Arrange
        var httpResponse = new HttpResponseMessage
        {
            StatusCode = System.Net.HttpStatusCode.OK,
            Content = new StringContent("test content")
        };
        httpResponse.Headers.Add("X-Request-Id", "request-123");
        httpResponse.Headers.Add("X-Custom-Header", new[] { "value1", "value2" });

        // Act
        var responseHeaders = ResponseHeaders.FromHttpResponseMessage(httpResponse);

        // Assert
        Assert.That(responseHeaders.Contains("X-Request-Id"), Is.True);
        Assert.That(responseHeaders.TryGetValue("X-Request-Id", out var requestId), Is.True);
        Assert.That(requestId, Is.EqualTo("request-123"));

        Assert.That(responseHeaders.TryGetValues("X-Custom-Header", out var customValues), Is.True);
        Assert.That(customValues, Is.EqualTo(new[] { "value1", "value2" }));
    }

    [Test]
    public void FromHttpResponseMessage_ShouldExtractContentHeaders()
    {
        // Arrange
        var httpResponse = new HttpResponseMessage
        {
            StatusCode = System.Net.HttpStatusCode.OK,
            Content = new StringContent("test content")
        };
        // Content headers are automatically added by StringContent

        // Act
        var responseHeaders = ResponseHeaders.FromHttpResponseMessage(httpResponse);

        // Assert
        Assert.That(responseHeaders.Contains("Content-Type"), Is.True);
        Assert.That(responseHeaders.Contains("Content-Length"), Is.True);
    }

    [Test]
    public void FromHttpResponseMessage_WithNullContent_ShouldOnlyIncludeResponseHeaders()
    {
        // Arrange
        var httpResponse = new HttpResponseMessage
        {
            StatusCode = System.Net.HttpStatusCode.NoContent,
            Content = null
        };
        httpResponse.Headers.Add("X-Request-Id", "request-123");

        // Act
        var responseHeaders = ResponseHeaders.FromHttpResponseMessage(httpResponse);

        // Assert
        Assert.That(responseHeaders.Contains("X-Request-Id"), Is.True);
        // No content headers should be present
    }

    [Test]
    public void FromHttpResponseMessage_ShouldBeCaseInsensitive()
    {
        // Arrange
        var httpResponse = new HttpResponseMessage
        {
            StatusCode = System.Net.HttpStatusCode.OK,
            Content = new StringContent("test")
        };
        httpResponse.Headers.Add("X-Custom-Header", "value");

        // Act
        var responseHeaders = ResponseHeaders.FromHttpResponseMessage(httpResponse);

        // Assert
        Assert.That(responseHeaders.Contains("x-custom-header"), Is.True);
        Assert.That(responseHeaders.Contains("X-CUSTOM-HEADER"), Is.True);
        Assert.That(responseHeaders.Contains("X-Custom-Header"), Is.True);
    }
}
