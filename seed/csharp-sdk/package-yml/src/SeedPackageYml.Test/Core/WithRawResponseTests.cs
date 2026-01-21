using System.Net;
using System.Net.Http.Headers;
using NUnit.Framework;
using SeedPackageYml;
using SeedPackageYml.Core;

namespace SeedPackageYml.Test.Core;

[TestFixture]
public class WithRawResponseTests
{
    [Test]
    public async global::System.Threading.Tasks.Task WithRawResponseTask_DirectAwait_ReturnsData()
    {
        // Arrange
        var expectedData = "test-data";
        var task = CreateWithRawResponseTask(expectedData, HttpStatusCode.OK);

        // Act
        var result = await task;

        // Assert
        Assert.That(result, Is.EqualTo(expectedData));
    }

    [Test]
    public async global::System.Threading.Tasks.Task WithRawResponseTask_WithRawResponse_ReturnsDataAndMetadata()
    {
        // Arrange
        var expectedData = "test-data";
        var expectedStatusCode = HttpStatusCode.Created;
        var task = CreateWithRawResponseTask(expectedData, expectedStatusCode);

        // Act
        var result = await task.WithRawResponse();

        // Assert
        Assert.That(result.Data, Is.EqualTo(expectedData));
        Assert.That(result.RawResponse.StatusCode, Is.EqualTo(expectedStatusCode));
        Assert.That(result.RawResponse.Url, Is.Not.Null);
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_TryGetValue_CaseInsensitive()
    {
        // Arrange
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        response.Headers.Add("X-Request-Id", "12345");
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act & Assert
        Assert.That(headers.TryGetValue("X-Request-Id", out var value), Is.True);
        Assert.That(value, Is.EqualTo("12345"));

        Assert.That(headers.TryGetValue("x-request-id", out value), Is.True);
        Assert.That(value, Is.EqualTo("12345"));

        Assert.That(headers.TryGetValue("X-REQUEST-ID", out value), Is.True);
        Assert.That(value, Is.EqualTo("12345"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_TryGetValues_ReturnsMultipleValues()
    {
        // Arrange
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        response.Headers.Add("Set-Cookie", new[] { "cookie1=value1", "cookie2=value2" });
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act
        var success = headers.TryGetValues("Set-Cookie", out var values);

        // Assert
        Assert.That(success, Is.True);
        Assert.That(values, Is.Not.Null);
        Assert.That(values!.Count(), Is.EqualTo(2));
        Assert.That(values, Does.Contain("cookie1=value1"));
        Assert.That(values, Does.Contain("cookie2=value2"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_ContentType_ReturnsValue()
    {
        // Arrange
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        response.Content = new StringContent(
            "{}",
            global::System.Text.Encoding.UTF8,
            "application/json"
        );
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act
        var contentType = headers.ContentType;

        // Assert
        Assert.That(contentType, Is.Not.Null);
        Assert.That(contentType, Does.Contain("application/json"));
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_ContentLength_ReturnsValue()
    {
        // Arrange
        var content = "test content";
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        response.Content = new StringContent(content);
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act
        var contentLength = headers.ContentLength;

        // Assert
        Assert.That(contentLength, Is.Not.Null);
        Assert.That(contentLength, Is.GreaterThan(0));
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_Contains_ReturnsTrueForExistingHeader()
    {
        // Arrange
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        response.Headers.Add("X-Custom-Header", "value");
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act & Assert
        Assert.That(headers.Contains("X-Custom-Header"), Is.True);
        Assert.That(headers.Contains("x-custom-header"), Is.True);
        Assert.That(headers.Contains("NonExistent"), Is.False);
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_Enumeration_IncludesAllHeaders()
    {
        // Arrange
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        response.Headers.Add("X-Header-1", "value1");
        response.Headers.Add("X-Header-2", "value2");
        response.Content = new StringContent("test");
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act
        var allHeaders = headers.ToList();

        // Assert
        Assert.That(allHeaders.Count, Is.GreaterThan(0));
        Assert.That(allHeaders.Any(h => h.Name == "X-Header-1"), Is.True);
        Assert.That(allHeaders.Any(h => h.Name == "X-Header-2"), Is.True);
    }

    [Test]
    public async global::System.Threading.Tasks.Task WithRawResponseTask_ErrorStatusCode_StillReturnsMetadata()
    {
        // Arrange
        var expectedData = "error-data";
        var task = CreateWithRawResponseTask(expectedData, HttpStatusCode.BadRequest);

        // Act
        var result = await task.WithRawResponse();

        // Assert
        Assert.That(result.Data, Is.EqualTo(expectedData));
        Assert.That(result.RawResponse.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async global::System.Threading.Tasks.Task WithRawResponseTask_Url_IsPreserved()
    {
        // Arrange
        var expectedUrl = new Uri("https://api.example.com/users/123");
        var task = CreateWithRawResponseTask("data", HttpStatusCode.OK, expectedUrl);

        // Act
        var result = await task.WithRawResponse();

        // Assert
        Assert.That(result.RawResponse.Url, Is.EqualTo(expectedUrl));
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_TryGetValue_NonExistentHeader_ReturnsFalse()
    {
        // Arrange
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act
        var success = headers.TryGetValue("X-NonExistent", out var value);

        // Assert
        Assert.That(success, Is.False);
        Assert.That(value, Is.Null);
    }

    [Test]
    public async global::System.Threading.Tasks.Task ResponseHeaders_TryGetValues_NonExistentHeader_ReturnsFalse()
    {
        // Arrange
        using var response = CreateHttpResponse(HttpStatusCode.OK);
        var headers = ResponseHeaders.FromHttpResponseMessage(response);

        // Act
        var success = headers.TryGetValues("X-NonExistent", out var values);

        // Assert
        Assert.That(success, Is.False);
        Assert.That(values, Is.Null);
    }

    [Test]
    public async global::System.Threading.Tasks.Task WithRawResponseTask_ImplicitConversion_ToTask()
    {
        // Arrange
        var expectedData = "test-data";
        var task = CreateWithRawResponseTask(expectedData, HttpStatusCode.OK);

        // Act - implicitly convert to Task<T>
        global::System.Threading.Tasks.Task<string> regularTask = task;
        var result = await regularTask;

        // Assert
        Assert.That(result, Is.EqualTo(expectedData));
    }

    [Test]
    public void WithRawResponseTask_ImplicitConversion_AssignToTaskVariable()
    {
        // Arrange
        var expectedData = "test-data";
        var wrappedTask = CreateWithRawResponseTask(expectedData, HttpStatusCode.OK);

        // Act - assign to Task<T> variable
        global::System.Threading.Tasks.Task<string> regularTask = wrappedTask;

        // Assert
        Assert.That(regularTask, Is.Not.Null);
        Assert.That(regularTask, Is.InstanceOf<global::System.Threading.Tasks.Task<string>>());
    }

    // Helper methods

    private static WithRawResponseTask<T> CreateWithRawResponseTask<T>(
        T data,
        HttpStatusCode statusCode,
        Uri? url = null
    )
    {
        url ??= new Uri("https://api.example.com/test");
        using var httpResponse = CreateHttpResponse(statusCode);
        httpResponse.RequestMessage = new HttpRequestMessage(HttpMethod.Get, url);

        var rawResponse = new RawResponse
        {
            StatusCode = statusCode,
            Url = url,
            Headers = ResponseHeaders.FromHttpResponseMessage(httpResponse),
        };

        var withRawResponse = new WithRawResponse<T> { Data = data, RawResponse = rawResponse };

        var task = global::System.Threading.Tasks.Task.FromResult(withRawResponse);
        return new WithRawResponseTask<T>(task);
    }

    private static HttpResponseMessage CreateHttpResponse(HttpStatusCode statusCode)
    {
        return new HttpResponseMessage(statusCode) { Content = new StringContent("") };
    }
}
