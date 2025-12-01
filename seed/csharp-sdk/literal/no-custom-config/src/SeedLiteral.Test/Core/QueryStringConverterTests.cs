using NUnit.Framework;
using SeedLiteral.Core;

namespace SeedLiteral.Test.Core;

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
}
