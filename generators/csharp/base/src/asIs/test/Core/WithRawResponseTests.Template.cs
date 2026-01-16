using System;
using System.Collections.Generic;
using System.Net;
using NUnit.Framework;
using <%= namespace %>;

namespace <%= testNamespace %>.Core;

[TestFixture]
public class WithRawResponseTests
{
    [Test]
    public void Constructor_WithStringData_ShouldInitializeCorrectly()
    {
        // Arrange
        var data = "Hello, World!";
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<string>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data, Is.EqualTo(data));
        Assert.That(wrappedResponse.RawResponse, Is.EqualTo(rawResponse));
    }

    [Test]
    public void Constructor_WithComplexObject_ShouldInitializeCorrectly()
    {
        // Arrange
        var data = new TestModel
        {
            Id = 123,
            Name = "Test User",
            Email = "test@example.com"
        };
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<TestModel>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data.Id, Is.EqualTo(123));
        Assert.That(wrappedResponse.Data.Name, Is.EqualTo("Test User"));
        Assert.That(wrappedResponse.Data.Email, Is.EqualTo("test@example.com"));
        Assert.That(wrappedResponse.RawResponse.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public void Constructor_WithNullableData_ShouldAllowNull()
    {
        // Arrange
        TestModel? data = null;
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<TestModel?>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data, Is.Null);
        Assert.That(wrappedResponse.RawResponse, Is.Not.Null);
    }

    [Test]
    public void Constructor_WithCollectionData_ShouldInitializeCorrectly()
    {
        // Arrange
        var data = new List<string> { "item1", "item2", "item3" };
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<List<string>>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data, Has.Count.EqualTo(3));
        Assert.That(wrappedResponse.Data, Is.EqualTo(data));
    }

    [Test]
    public void Constructor_WithDictionaryData_ShouldInitializeCorrectly()
    {
        // Arrange
        var data = new Dictionary<string, int>
        {
            ["key1"] = 100,
            ["key2"] = 200,
            ["key3"] = 300
        };
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<Dictionary<string, int>>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data, Has.Count.EqualTo(3));
        Assert.That(wrappedResponse.Data["key1"], Is.EqualTo(100));
        Assert.That(wrappedResponse.Data["key2"], Is.EqualTo(200));
        Assert.That(wrappedResponse.Data["key3"], Is.EqualTo(300));
    }

    [Test]
    public void Data_ShouldProvideAccessToParsedResponse()
    {
        // Arrange
        var data = 42;
        var rawResponse = CreateSampleRawResponse();
        var wrappedResponse = new WithRawResponse<int>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Act
        var retrievedData = wrappedResponse.Data;

        // Assert
        Assert.That(retrievedData, Is.EqualTo(42));
    }

    [Test]
    public void RawResponse_ShouldProvideAccessToHttpMetadata()
    {
        // Arrange
        var data = "test";
        var rawResponse = new RawResponse
        {
            StatusCode = HttpStatusCode.Created,
            Url = new Uri("https://api.example.com/resources/456"),
            Headers = new ResponseHeaders(
                new Dictionary<string, IEnumerable<string>>
                {
                    ["X-Request-Id"] = new[] { "req-789" },
                    ["X-Rate-Limit-Remaining"] = new[] { "95" }
                }
            )
        };
        var wrappedResponse = new WithRawResponse<string>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Act & Assert
        Assert.That(wrappedResponse.RawResponse.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        Assert.That(wrappedResponse.RawResponse.Url.AbsolutePath, Is.EqualTo("/resources/456"));
        Assert.That(wrappedResponse.RawResponse.Headers.Contains("X-Request-Id"), Is.True);
        Assert.That(
            wrappedResponse.RawResponse.Headers.TryGetValue("X-Rate-Limit-Remaining", out var remaining),
            Is.True
        );
        Assert.That(remaining, Is.EqualTo("95"));
    }

    [Test]
    public void RecordEquality_WithSameValues_ShouldBeEqual()
    {
        // Arrange
        var data = "test-data";
        var rawResponse = CreateSampleRawResponse();

        var response1 = new WithRawResponse<string>
        {
            Data = data,
            RawResponse = rawResponse
        };

        var response2 = new WithRawResponse<string>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Act & Assert
        Assert.That(response1.Data, Is.EqualTo(response2.Data));
        Assert.That(response1.RawResponse, Is.EqualTo(response2.RawResponse));
    }

    [Test]
    public void RecordEquality_WithDifferentData_ShouldNotBeEqual()
    {
        // Arrange
        var rawResponse = CreateSampleRawResponse();

        var response1 = new WithRawResponse<string>
        {
            Data = "data1",
            RawResponse = rawResponse
        };

        var response2 = new WithRawResponse<string>
        {
            Data = "data2",
            RawResponse = rawResponse
        };

        // Act & Assert
        Assert.That(response1.Data, Is.Not.EqualTo(response2.Data));
    }

    [Test]
    public void RecordEquality_WithDifferentRawResponse_ShouldNotBeEqual()
    {
        // Arrange
        var data = "test";

        var rawResponse1 = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://example.com/path1"),
            Headers = new ResponseHeaders(new Dictionary<string, IEnumerable<string>>())
        };

        var rawResponse2 = new RawResponse
        {
            StatusCode = HttpStatusCode.Created,
            Url = new Uri("https://example.com/path2"),
            Headers = new ResponseHeaders(new Dictionary<string, IEnumerable<string>>())
        };

        var response1 = new WithRawResponse<string>
        {
            Data = data,
            RawResponse = rawResponse1
        };

        var response2 = new WithRawResponse<string>
        {
            Data = data,
            RawResponse = rawResponse2
        };

        // Act & Assert
        Assert.That(response1.RawResponse.StatusCode, Is.Not.EqualTo(response2.RawResponse.StatusCode));
        Assert.That(response1.RawResponse.Url, Is.Not.EqualTo(response2.RawResponse.Url));
    }

    [Test]
    public void ToString_ShouldIncludeDataAndMetadata()
    {
        // Arrange
        var data = "test-value";
        var rawResponse = new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://api.example.com/test"),
            Headers = new ResponseHeaders(new Dictionary<string, IEnumerable<string>>())
        };
        var wrappedResponse = new WithRawResponse<string>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Act
        var result = wrappedResponse.ToString();

        // Assert
        Assert.That(result, Does.Contain("test-value"));
        Assert.That(result, Does.Contain("OK"));
    }

    [Test]
    public void GenericType_WithValueType_ShouldWork()
    {
        // Arrange
        var data = 123.45;
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<double>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data, Is.EqualTo(123.45));
    }

    [Test]
    public void GenericType_WithEnumType_ShouldWork()
    {
        // Arrange
        var data = TestEnum.Value2;
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<TestEnum>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data, Is.EqualTo(TestEnum.Value2));
    }

    [Test]
    public void GenericType_WithNestedGeneric_ShouldWork()
    {
        // Arrange
        var data = new List<List<int>>
        {
            new() { 1, 2, 3 },
            new() { 4, 5, 6 }
        };
        var rawResponse = CreateSampleRawResponse();

        // Act
        var wrappedResponse = new WithRawResponse<List<List<int>>>
        {
            Data = data,
            RawResponse = rawResponse
        };

        // Assert
        Assert.That(wrappedResponse.Data, Has.Count.EqualTo(2));
        Assert.That(wrappedResponse.Data[0], Has.Count.EqualTo(3));
        Assert.That(wrappedResponse.Data[1], Has.Count.EqualTo(3));
    }

    // Helper methods
    private static RawResponse CreateSampleRawResponse()
    {
        return new RawResponse
        {
            StatusCode = HttpStatusCode.OK,
            Url = new Uri("https://api.example.com/test"),
            Headers = new ResponseHeaders(
                new Dictionary<string, IEnumerable<string>>
                {
                    ["Content-Type"] = new[] { "application/json" }
                }
            )
        };
    }

    // Test models
    private class TestModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    private enum TestEnum
    {
        Value1,
        Value2,
        Value3
    }
}
