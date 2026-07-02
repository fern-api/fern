using global::System.Text.Json;
using NUnit.Framework;
using SeedExhaustive;

namespace SeedExhaustive.Test.Core;

[TestFixture]
public class ApiExceptionTests
{
    [Test]
    public void ToString_WithMessageAndStatusCode_IncludesBasicInfo()
    {
        var exception = new SeedExhaustiveApiException("Not Found", 404, "error body");

        var result = exception.ToString();

        Assert.That(result, Does.Contain("Not Found"));
        Assert.That(result, Does.Contain("404"));
    }

    [Test]
    public void ToString_ContainsFullTypeName()
    {
        var exception = new SeedExhaustiveApiException("Error", 500, "body");

        var result = exception.ToString();

        Assert.That(result, Does.Contain("SeedExhaustive.SeedExhaustiveApiException"));
    }

    [Test]
    public void ToString_WithStringBody_IncludesSerializedBody()
    {
        var exception = new SeedExhaustiveApiException("Bad Request", 400, "some error text");

        var result = exception.ToString();

        Assert.That(result, Does.Contain("Body:"));
        Assert.That(result, Does.Contain("some error text"));
    }

    [Test]
    public void ToString_WithObjectBody_SerializesBodyAsJson()
    {
        var body = new Dictionary<string, object>
        {
            { "error", "invalid_token" },
            { "message", "Token has expired" },
        };

        var exception = new SeedExhaustiveApiException("Unauthorized", 401, body);

        var result = exception.ToString();
        var expectedJson = JsonSerializer.Serialize(body);

        Assert.That(result, Does.Contain("Body:"));
        Assert.That(result, Does.Contain(expectedJson));
    }

    [Test]
    public void ToString_WithNestedObjectBody_SerializesNestedJson()
    {
        var body = new Dictionary<string, object>
        {
            {
                "errors",
                new[]
                {
                    new Dictionary<string, object> { { "field", "email" }, { "code", "required" } },
                }
            },
        };

        var exception = new SeedExhaustiveApiException("Validation Failed", 422, body);

        var result = exception.ToString();

        Assert.That(result, Does.Contain("Body:"));
        Assert.That(result, Does.Contain("email"));
        Assert.That(result, Does.Contain("required"));
    }

    [Test]
    public void ToString_WithNullBody_OmitsBodySection()
    {
        var exception = new SeedExhaustiveApiException("No Content", 204, null!);

        var result = exception.ToString();

        Assert.That(result, Does.Not.Contain("Body:"));
    }

    [Test]
    public void ToString_WithNumericBody_SerializesNumber()
    {
        var exception = new SeedExhaustiveApiException("Error", 500, 42);

        var result = exception.ToString();

        Assert.That(result, Does.Contain("Body:"));
        Assert.That(result, Does.Contain("42"));
    }

    [Test]
    public void ToString_WithListBody_SerializesArray()
    {
        var body = new List<string> { "error1", "error2", "error3" };

        var exception = new SeedExhaustiveApiException("Multiple Errors", 400, body);

        var result = exception.ToString();

        Assert.That(result, Does.Contain("Body:"));
        Assert.That(result, Does.Contain("error1"));
        Assert.That(result, Does.Contain("error2"));
    }

    [Test]
    public void ToString_WithEmptyStringBody_IncludesEmptyStringInBody()
    {
        var exception = new SeedExhaustiveApiException("Error", 400, "");

        var result = exception.ToString();

        Assert.That(result, Does.Contain("Body:"));
    }

    [Test]
    public void ToString_WithBooleanBody_SerializesBoolean()
    {
        var exception = new SeedExhaustiveApiException("Error", 400, false);

        var result = exception.ToString();

        Assert.That(result, Does.Contain("Body:"));
        Assert.That(result, Does.Contain("false"));
    }

    [Test]
    public void ToString_WithInnerException_IncludesInnerExceptionDetails()
    {
        var inner = new global::System.InvalidOperationException("connection refused");

        var exception = new SeedExhaustiveApiException(
            "Service Unavailable",
            503,
            "gateway timeout",
            inner
        );

        var result = exception.ToString();

        Assert.That(result, Does.Contain("connection refused"));
        Assert.That(result, Does.Contain("End of inner exception stack trace"));
    }

    [Test]
    public void ToString_WithoutInnerException_OmitsInnerExceptionSection()
    {
        var exception = new SeedExhaustiveApiException("Error", 500, "body");

        var result = exception.ToString();

        Assert.That(result, Does.Not.Contain("End of inner exception stack trace"));
    }

    [Test]
    public void ToString_WithNestedInnerExceptions_IncludesOutermostInnerException()
    {
        var innerMost = new global::System.IO.IOException("disk full");
        var inner = new global::System.InvalidOperationException("write failed", innerMost);

        var exception = new SeedExhaustiveApiException("Error", 500, "body", inner);

        var result = exception.ToString();

        Assert.That(result, Does.Contain("write failed"));
    }

    [Test]
    public void ToString_WithSpecialCharactersInMessage_PreservesCharacters()
    {
        var exception = new SeedExhaustiveApiException(
            "Error: \"quotes\" & <brackets>",
            400,
            "body"
        );

        var result = exception.ToString();

        Assert.That(result, Does.Contain("\"quotes\""));
        Assert.That(result, Does.Contain("<brackets>"));
    }

    [Test]
    public void StatusCode_ReturnsCorrectValue()
    {
        var exception = new SeedExhaustiveApiException("Error", 429, "rate limited");

        Assert.That(exception.StatusCode, Is.EqualTo(429));
    }

    [Test]
    public void Body_ReturnsCorrectValue()
    {
        var body = new Dictionary<string, string> { { "key", "value" } };

        var exception = new SeedExhaustiveApiException("Error", 500, body);

        Assert.That(exception.Body, Is.SameAs(body));
    }

    [Test]
    public void Message_ReturnsCorrectValue()
    {
        var exception = new SeedExhaustiveApiException("Something went wrong", 500, "body");

        Assert.That(exception.Message, Is.EqualTo("Something went wrong"));
    }

    [Test]
    public void InheritsFromBaseException()
    {
        var exception = new SeedExhaustiveApiException("Error", 500, "body");

        Assert.That(exception, Is.InstanceOf<SeedExhaustiveException>());
        Assert.That(exception, Is.InstanceOf<global::System.Exception>());
    }
}
