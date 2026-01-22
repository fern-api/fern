using NUnit.Framework;
using <%= namespace%>.Core;

namespace <%= testNamespace%>.Core;

[TestFixture]
public class QueryStringBuilderTests
{
    [Test]
    public void Build_EmptyParameters_ReturnsEmptyString()
    {
        var result = QueryStringBuilder.Build(new List<KeyValuePair<string, string>>());
        Assert.That(result, Is.EqualTo(string.Empty));
    }

    [Test]
    public void Build_SingleParameter_ReturnsQueryString()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("name", "John"),
        };
        var result = QueryStringBuilder.Build(parameters);
        Assert.That(result, Is.EqualTo("?name=John"));
    }

    [Test]
    public void Build_MultipleParameters_ReturnsQueryString()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("name", "John"),
            new("age", "30"),
        };
        var result = QueryStringBuilder.Build(parameters);
        Assert.That(result, Is.EqualTo("?name=John&age=30"));
    }

    [Test]
    public void Build_ParameterWithSpaces_EncodesSpaces()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("name", "John Doe"),
        };
        var result = QueryStringBuilder.Build(parameters);
        Assert.That(result, Is.EqualTo("?name=John%20Doe"));
    }

    [Test]
    public void Build_ParameterWithSpecialCharacters_EncodesSpecialCharacters()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("email", "test@example.com"),
        };
        var result = QueryStringBuilder.Build(parameters);
        Assert.That(result, Is.EqualTo("?email=test%40example.com"));
    }

    [Test]
    public void Build_ParameterWithBrackets_EncodesBrackets()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("filter[name]", "John"),
        };
        var result = QueryStringBuilder.Build(parameters);
        Assert.That(result, Is.EqualTo("?filter%5Bname%5D=John"));
    }

    [Test]
    public void Builder_Add_AddsSimpleParameter()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("name", "John")
            .Build();
        Assert.That(result, Is.EqualTo("?name=John"));
    }

    [Test]
    public void Builder_Add_IgnoresNullValue()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("name", null)
            .Build();
        Assert.That(result, Is.EqualTo(string.Empty));
    }

    [Test]
    public void Builder_AddDeepObject_AddsNestedParameters()
    {
        var result = new QueryStringBuilder.Builder()
            .AddDeepObject(
                "settings",
                new
                {
                    Name = "John",
                    Age = 30,
                }
            )
            .Build();
        Assert.That(result, Is.EqualTo("?settings%5BName%5D=John&settings%5BAge%5D=30"));
    }

    [Test]
    public void Builder_AddDeepObject_IgnoresNullValue()
    {
        var result = new QueryStringBuilder.Builder()
            .AddDeepObject("settings", null)
            .Build();
        Assert.That(result, Is.EqualTo(string.Empty));
    }

    [Test]
    public void Builder_AddExploded_AddsExplodedParameters()
    {
        var result = new QueryStringBuilder.Builder()
            .AddExploded(
                "tags",
                new
                {
                    Values = new[] { "a", "b" },
                }
            )
            .Build();
        Assert.That(result, Is.EqualTo("?tags%5BValues%5D=a&tags%5BValues%5D=b"));
    }

    [Test]
    public void Builder_AddExploded_IgnoresNullValue()
    {
        var result = new QueryStringBuilder.Builder()
            .AddExploded("tags", null)
            .Build();
        Assert.That(result, Is.EqualTo(string.Empty));
    }

    [Test]
    public void Builder_ChainingMethods_BuildsCompleteQueryString()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("access_token", "abc123")
            .Add("config_id", "cfg-456")
            .AddDeepObject(
                "session_settings",
                new
                {
                    SystemPrompt = "Hello",
                }
            )
            .Build();
        Assert.That(
            result,
            Is.EqualTo(
                "?access_token=abc123&config_id=cfg-456&session_settings%5BSystemPrompt%5D=Hello"
            )
        );
    }

    [Test]
    public void Builder_WithCapacity_InitializesWithCapacity()
    {
        var result = new QueryStringBuilder.Builder(capacity: 10)
            .Add("name", "John")
            .Build();
        Assert.That(result, Is.EqualTo("?name=John"));
    }
}
