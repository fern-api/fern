using NUnit.Framework;
using SeedFileUpload.Core;

namespace SeedFileUpload.Test.Core;

[TestFixture]
public class QueryStringConverterTests
{
    [Test]
    public void ToQueryStringCollection_ValidObject_ReturnsCorrectQueryStringCollection()
    {
        var obj = new { Name = "John", Age = 30 };
        var result = QueryStringConverter.ToQueryStringCollection(obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("Name", "John"),
            new("Age", "30"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ValidDeepObject_ReturnsCorrectQueryStringCollection()
    {
        var obj = new
        {
            Name = "John",
            Age = 30,
            Address = new { Street = "123 Main St", City = "Anytown" },
        };
        var result = QueryStringConverter.ToQueryStringCollection(obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("Name", "John"),
            new("Age", "30"),
            new("Address[Street]", "123 Main St"),
            new("Address[City]", "Anytown"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_ValidObjectWithArray_ReturnsCorrectQueryStringCollection()
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
        var result = QueryStringConverter.ToQueryStringCollection(obj);
        var expected = new List<KeyValuePair<string, string>>
        {
            new("Name", "John"),
            new("Age", "30"),
            new("Address[Street]", "123 Main St"),
            new("Address[City]", "Anytown"),
            new("Address[Coordinates][]", "39.78172"),
            new("Address[Coordinates][]", "-89.65015"),
            new("Tags[]", "Developer"),
            new("Tags[]", "Blogger"),
        };
        Assert.That(result, Is.EqualTo(expected));
    }

    [Test]
    public void ToQueryStringCollection_OnString_ThrowsException()
    {
        var exception = Assert.Throws<Exception>(
            () => QueryStringConverter.ToQueryStringCollection("invalid")
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
        var exception = Assert.Throws<Exception>(
            () => QueryStringConverter.ToQueryStringCollection(Array.Empty<object>())
        );
        Assert.That(
            exception.Message,
            Is.EqualTo(
                "Only objects can be converted to query string collections. Given type is Array."
            )
        );
    }
}
