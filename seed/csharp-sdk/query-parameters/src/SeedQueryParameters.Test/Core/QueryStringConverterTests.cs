using NUnit.Framework;
using SeedQueryParameters.Core;

namespace SeedQueryParameters.Test.Core;

[TestFixture]
public class QueryStringConverterTests
{
    [Test]
    public void ToQueryStringCollection_Form()
    {
        var obj = new
        {
            Name = "John",
            Age = 30,
            Address = new
            {
                Street = "123 Main St",
                City = "Anytown",
                Coordinates = new[] { 39.781721f, -89.650148f },
            },
            Tags = new[] { "Developer", "Blogger" },
        };
        var result = QueryStringConverter.ToForm(obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("Name", "John"),
            new("Age", "30"),
            new("Address[Street]", "123 Main St"),
            new("Address[City]", "Anytown"),
            new("Address[Coordinates]", "39.78172,-89.65015"),
            new("Tags", "Developer,Blogger"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ExplodedForm()
    {
        var obj = new
        {
            Name = "John",
            Age = 30,
            Address = new
            {
                Street = "123 Main St",
                City = "Anytown",
                Coordinates = new[] { 39.781721f, -89.650148f },
            },
            Tags = new[] { "Developer", "Blogger" },
        };
        var result = QueryStringConverter.ToExplodedForm(obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("Name", "John"),
            new("Age", "30"),
            new("Address[Street]", "123 Main St"),
            new("Address[City]", "Anytown"),
            new("Address[Coordinates]", "39.78172"),
            new("Address[Coordinates]", "-89.65015"),
            new("Tags", "Developer"),
            new("Tags", "Blogger"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_DeepObject()
    {
        var obj = new
        {
            Name = "John",
            Age = 30,
            Address = new
            {
                Street = "123 Main St",
                City = "Anytown",
                Coordinates = new[] { 39.781721f, -89.650148f },
            },
            Tags = new[] { "Developer", "Blogger" },
        };
        var result = QueryStringConverter.ToDeepObject(obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("Name", "John"),
            new("Age", "30"),
            new("Address[Street]", "123 Main St"),
            new("Address[City]", "Anytown"),
            new("Address[Coordinates][0]", "39.78172"),
            new("Address[Coordinates][1]", "-89.65015"),
            new("Tags[0]", "Developer"),
            new("Tags[1]", "Blogger"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_OnString_ThrowsException()
    {
        var exception = Assert.Throws<global::System.Exception>(() =>
            QueryStringConverter.ToForm("invalid")
        );
        Assert.That(
            exception.Message,
            Is.EqualTo(
                "Only objects can be converted to query string collections. Given type is String."
            )
        );
    }

    [Test]
    public void ToQueryStringCollection_OnArray_ThrowsException()
    {
        var exception = Assert.Throws<global::System.Exception>(() =>
            QueryStringConverter.ToForm(Array.Empty<object>())
        );
        Assert.That(
            exception.Message,
            Is.EqualTo(
                "Only objects can be converted to query string collections. Given type is Array."
            )
        );
    }

    [Test]
    public void ToQueryStringCollection_DeepObject_WithPrefix()
    {
        var obj = new
        {
            custom_session_id = "my-id",
            system_prompt = "You are helpful",
            variables = new { name = "Alice", age = 25 },
        };
        var result = QueryStringConverter.ToDeepObject("session_settings", obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("session_settings[custom_session_id]", "my-id"),
            new("session_settings[system_prompt]", "You are helpful"),
            new("session_settings[variables][name]", "Alice"),
            new("session_settings[variables][age]", "25"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ExplodedForm_WithPrefix()
    {
        var obj = new { Name = "John", Tags = new[] { "Developer", "Blogger" } };
        var result = QueryStringConverter.ToExplodedForm("user", obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("user[Name]", "John"),
            new("user[Tags]", "Developer"),
            new("user[Tags]", "Blogger"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ExplodedForm_StringRoot()
    {
        var result = QueryStringConverter.ToExplodedForm("event_type", "group.created");
        var expected = new List<KeyValuePair<string, string>>
        {
            new("event_type", "group.created"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ExplodedForm_PrimitiveArrayRoot()
    {
        var result = QueryStringConverter.ToExplodedForm("event_type", new[] { "a", "b" });
        var expected = new List<KeyValuePair<string, string>>
        {
            new("event_type", "a"),
            new("event_type", "b"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ExplodedForm_NumberRoot()
    {
        var result = QueryStringConverter.ToExplodedForm("count", 42);
        var expected = new List<KeyValuePair<string, string>> { new("count", "42") };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ExplodedForm_BoolRoot()
    {
        var result = QueryStringConverter.ToExplodedForm("active", true);
        var expected = new List<KeyValuePair<string, string>> { new("active", "true") };
        Assert.That(result, Is.EqualTo(expected));
    }
}
