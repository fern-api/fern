using NUnit.Framework;
using SeedCsharpXmlEntities.Core;

namespace SeedCsharpXmlEntities.Test.Core;

[TestFixture]
public class QueryStringBuilderTests
{
    [Test]
    public void Build_SimpleParameters()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("name", "John Doe"),
            new("age", "30"),
            new("city", "New York"),
        };

        var result = QueryStringBuilder.Build(parameters);

        Assert.That(result, Is.EqualTo("?name=John%20Doe&age=30&city=New%20York"));
    }

    [Test]
    public void Build_EmptyList_ReturnsEmptyString()
    {
        var parameters = new List<KeyValuePair<string, string>>();

        var result = QueryStringBuilder.Build(parameters);

        Assert.That(result, Is.EqualTo(string.Empty));
    }

    [Test]
    public void Build_SpecialCharacters()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("email", "test@example.com"),
            new("url", "https://example.com/path?query=value"),
            new("special", "a+b=c&d"),
        };

        var result = QueryStringBuilder.Build(parameters);

        Assert.That(
            result,
            Is.EqualTo(
                "?email=test%40example.com&url=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue&special=a%2Bb%3Dc%26d"
            )
        );
    }

    [Test]
    public void Build_UnicodeCharacters()
    {
        var parameters = new List<KeyValuePair<string, string>> { new("greeting", "Hello 世界") };

        var result = QueryStringBuilder.Build(parameters);

        // Verify the Chinese characters are properly UTF-8 encoded
        Assert.That(result, Does.StartWith("?greeting=Hello%20"));
        Assert.That(result, Does.Contain("%E4%B8%96%E7%95%8C")); // 世界
    }

    [Test]
    public void Build_SessionSettings_DeepObject()
    {
        // Simulate session settings with nested properties
        var sessionSettings = new
        {
            custom_session_id = "my-custom-session-id",
            system_prompt = "You are a helpful assistant",
            variables = new Dictionary<string, object>
            {
                { "userName", "John" },
                { "userAge", 30 },
                { "isPremium", true },
            },
        };

        // Build query parameters list
        var queryParams = new List<KeyValuePair<string, string>> { new("api_key", "test_key_123") };

        // Add session_settings with prefix using the new overload
        queryParams.AddRange(
            QueryStringConverter.ToDeepObject("session_settings", sessionSettings)
        );

        var result = QueryStringBuilder.Build(queryParams);

        // Verify the result contains properly formatted deep object notation
        // Note: Square brackets are URL-encoded as %5B and %5D
        Assert.That(result, Does.StartWith("?api_key=test_key_123"));
        Assert.That(
            result,
            Does.Contain("session_settings%5Bcustom_session_id%5D=my-custom-session-id")
        );
        Assert.That(
            result,
            Does.Contain("session_settings%5Bsystem_prompt%5D=You%20are%20a%20helpful%20assistant")
        );
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5BuserName%5D=John"));
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5BuserAge%5D=30"));
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5BisPremium%5D=true"));

        // Verify it's NOT JSON encoded (no braces or quotes in the original format)
        Assert.That(result, Does.Not.Contain("%7B%22")); // Not {" sequence
    }

    [Test]
    public void Build_ChatApiLikeParameters()
    {
        // Simulate what ChatApi constructor does
        var sessionSettings = new
        {
            system_prompt = "You are helpful",
            variables = new Dictionary<string, object> { { "name", "Alice" } },
        };

        var queryParams = new List<KeyValuePair<string, string>>();

        // Simple parameters
        var simpleParams = new Dictionary<string, object?>
        {
            { "access_token", "token123" },
            { "config_id", "config456" },
            { "api_key", "key789" },
        };
        queryParams.AddRange(QueryStringConverter.ToExplodedForm(simpleParams));

        // Session settings as deep object with prefix
        queryParams.AddRange(
            QueryStringConverter.ToDeepObject("session_settings", sessionSettings)
        );

        var result = QueryStringBuilder.Build(queryParams);

        // Verify structure (square brackets are URL-encoded)
        Assert.That(result, Does.StartWith("?"));
        Assert.That(result, Does.Contain("access_token=token123"));
        Assert.That(result, Does.Contain("config_id=config456"));
        Assert.That(result, Does.Contain("api_key=key789"));
        Assert.That(
            result,
            Does.Contain("session_settings%5Bsystem_prompt%5D=You%20are%20helpful")
        );
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5Bname%5D=Alice"));
    }

    [Test]
    public void Build_ReservedCharacters_NotEncoded()
    {
        var parameters = new List<KeyValuePair<string, string>>
        {
            new("path", "some-path"),
            new("id", "123-456_789.test~value"),
        };

        var result = QueryStringBuilder.Build(parameters);

        // Unreserved characters: A-Z a-z 0-9 - _ . ~
        Assert.That(result, Is.EqualTo("?path=some-path&id=123-456_789.test~value"));
    }

    [Test]
    public void Builder_Add_SimpleParameters()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("name", "John Doe")
            .Add("age", 30)
            .Add("active", true)
            .Build();

        Assert.That(result, Does.Contain("name=John%20Doe"));
        Assert.That(result, Does.Contain("age=30"));
        Assert.That(result, Does.Contain("active=true"));
    }

    [Test]
    public void Builder_Add_NullValuesIgnored()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("name", "John")
            .Add("middle", null)
            .Add("age", 30)
            .Build();

        Assert.That(result, Does.Contain("name=John"));
        Assert.That(result, Does.Contain("age=30"));
        Assert.That(result, Does.Not.Contain("middle"));
    }

    [Test]
    public void Builder_AddDeepObject_WithPrefix()
    {
        var settings = new
        {
            custom_session_id = "id-123",
            system_prompt = "You are helpful",
            variables = new { name = "Alice", age = 25 },
        };

        var result = new QueryStringBuilder.Builder()
            .Add("api_key", "key123")
            .AddDeepObject("session_settings", settings)
            .Build();

        Assert.That(result, Does.Contain("api_key=key123"));
        Assert.That(result, Does.Contain("session_settings%5Bcustom_session_id%5D=id-123"));
        Assert.That(
            result,
            Does.Contain("session_settings%5Bsystem_prompt%5D=You%20are%20helpful")
        );
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5Bname%5D=Alice"));
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5Bage%5D=25"));
    }

    [Test]
    public void Builder_AddDeepObject_NullIgnored()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("api_key", "key123")
            .AddDeepObject("settings", null)
            .Build();

        Assert.That(result, Is.EqualTo("?api_key=key123"));
        Assert.That(result, Does.Not.Contain("settings"));
    }

    [Test]
    public void Builder_AddExploded_WithPrefix()
    {
        var filter = new { status = "active", type = "user" };

        var result = new QueryStringBuilder.Builder()
            .Add("api_key", "key123")
            .AddExploded("filter", filter)
            .Build();

        Assert.That(result, Does.Contain("api_key=key123"));
        Assert.That(result, Does.Contain("filter%5Bstatus%5D=active"));
        Assert.That(result, Does.Contain("filter%5Btype%5D=user"));
    }

    [Test]
    public void Builder_AddExploded_NullIgnored()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("api_key", "key123")
            .AddExploded("filter", null)
            .Build();

        Assert.That(result, Is.EqualTo("?api_key=key123"));
        Assert.That(result, Does.Not.Contain("filter"));
    }

    [Test]
    public void Builder_WithCapacity()
    {
        // Test that capacity constructor works without errors
        var result = new QueryStringBuilder.Builder(capacity: 10)
            .Add("param1", "value1")
            .Add("param2", "value2")
            .Build();

        Assert.That(result, Does.Contain("param1=value1"));
        Assert.That(result, Does.Contain("param2=value2"));
    }

    [Test]
    public void Builder_ChatApiLikeUsage()
    {
        // Simulate real usage from ChatApi
        var sessionSettings = new
        {
            custom_session_id = "session-123",
            variables = new Dictionary<string, object>
            {
                { "userName", "John" },
                { "userAge", 30 },
            },
        };

        var result = new QueryStringBuilder.Builder(capacity: 16)
            .Add("access_token", "token123")
            .Add("allow_connection", true)
            .Add("config_id", "config456")
            .Add("api_key", "key789")
            .AddDeepObject("session_settings", sessionSettings)
            .Build();

        Assert.That(result, Does.StartWith("?"));
        Assert.That(result, Does.Contain("access_token=token123"));
        Assert.That(result, Does.Contain("allow_connection=true"));
        Assert.That(result, Does.Contain("config_id=config456"));
        Assert.That(result, Does.Contain("api_key=key789"));
        Assert.That(result, Does.Contain("session_settings%5Bcustom_session_id%5D=session-123"));
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5BuserName%5D=John"));
        Assert.That(result, Does.Contain("session_settings%5Bvariables%5D%5BuserAge%5D=30"));
    }

    [Test]
    public void Builder_EmptyBuilder_ReturnsEmptyString()
    {
        var result = new QueryStringBuilder.Builder().Build();

        Assert.That(result, Is.EqualTo(string.Empty));
    }

    [Test]
    public void Builder_OnlyNullValues_ReturnsEmptyString()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("param1", null)
            .Add("param2", null)
            .AddDeepObject("settings", null)
            .Build();

        Assert.That(result, Is.EqualTo(string.Empty));
    }

    [Test]
    public void Builder_Set_OverridesSingleValue()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("foo", "original")
            .Set("foo", "override")
            .Build();

        Assert.That(result, Is.EqualTo("?foo=override"));
    }

    [Test]
    public void Builder_Set_OverridesMultipleValues()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("foo", "value1")
            .Add("foo", "value2")
            .Set("foo", "override")
            .Build();

        Assert.That(result, Is.EqualTo("?foo=override"));
    }

    [Test]
    public void Builder_Set_WithArray_CreatesMultipleParameters()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("foo", "original")
            .Set("foo", new[] { "value1", "value2" })
            .Build();

        Assert.That(result, Is.EqualTo("?foo=value1&foo=value2"));
    }

    [Test]
    public void Builder_Set_WithNull_RemovesParameter()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("foo", "original")
            .Add("bar", "keep")
            .Set("foo", null)
            .Build();

        Assert.That(result, Is.EqualTo("?bar=keep"));
    }

    [Test]
    public void Builder_MergeAdditional_WithSingleValues()
    {
        var additional = new List<KeyValuePair<string, string>>
        {
            new("foo", "bar"),
            new("baz", "qux"),
        };

        var result = new QueryStringBuilder.Builder()
            .Add("existing", "value")
            .MergeAdditional(additional)
            .Build();

        Assert.That(result, Does.Contain("existing=value"));
        Assert.That(result, Does.Contain("foo=bar"));
        Assert.That(result, Does.Contain("baz=qux"));
    }

    [Test]
    public void Builder_MergeAdditional_WithDuplicateKeys_CreatesList()
    {
        var additional = new List<KeyValuePair<string, string>>
        {
            new("foo", "bar1"),
            new("foo", "bar2"),
            new("baz", "qux"),
        };

        var result = new QueryStringBuilder.Builder()
            .Add("existing", "value")
            .MergeAdditional(additional)
            .Build();

        Assert.That(result, Does.Contain("existing=value"));
        Assert.That(result, Does.Contain("foo=bar1"));
        Assert.That(result, Does.Contain("foo=bar2"));
        Assert.That(result, Does.Contain("baz=qux"));
    }

    [Test]
    public void Builder_MergeAdditional_OverridesExistingParameters()
    {
        var additional = new List<KeyValuePair<string, string>> { new("foo", "override") };

        var result = new QueryStringBuilder.Builder()
            .Add("foo", "original1")
            .Add("foo", "original2")
            .Add("bar", "keep")
            .MergeAdditional(additional)
            .Build();

        Assert.That(result, Does.Contain("bar=keep"));
        Assert.That(result, Does.Contain("foo=override"));
        Assert.That(result, Does.Not.Contain("original1"));
        Assert.That(result, Does.Not.Contain("original2"));
    }

    [Test]
    public void Builder_MergeAdditional_WithDuplicates_OverridesExisting()
    {
        var additional = new List<KeyValuePair<string, string>>
        {
            new("foo", "new1"),
            new("foo", "new2"),
            new("foo", "new3"),
        };

        var result = new QueryStringBuilder.Builder()
            .Add("foo", "original1")
            .Add("foo", "original2")
            .Add("bar", "keep")
            .MergeAdditional(additional)
            .Build();

        Assert.That(result, Does.Contain("bar=keep"));
        Assert.That(result, Does.Contain("foo=new1"));
        Assert.That(result, Does.Contain("foo=new2"));
        Assert.That(result, Does.Contain("foo=new3"));
        Assert.That(result, Does.Not.Contain("original1"));
        Assert.That(result, Does.Not.Contain("original2"));
    }

    [Test]
    public void Builder_MergeAdditional_WithNull_NoOp()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("foo", "value")
            .MergeAdditional(null)
            .Build();

        Assert.That(result, Is.EqualTo("?foo=value"));
    }

    [Test]
    public void Builder_MergeAdditional_WithEmptyList_NoOp()
    {
        var additional = new List<KeyValuePair<string, string>>();

        var result = new QueryStringBuilder.Builder()
            .Add("foo", "value")
            .MergeAdditional(additional)
            .Build();

        Assert.That(result, Is.EqualTo("?foo=value"));
    }

    [Test]
    public void Builder_MergeAdditional_RealWorldScenario()
    {
        // SDK generates foo=foo1&foo=foo2
        var builder = new QueryStringBuilder.Builder()
            .Add("foo", "foo1")
            .Add("foo", "foo2")
            .Add("bar", "baz");

        // User provides foo=override in AdditionalQueryParameters
        var additional = new List<KeyValuePair<string, string>> { new("foo", "override") };

        var result = builder.MergeAdditional(additional).Build();

        // Result should be foo=override&bar=baz (user overrides SDK)
        Assert.That(result, Does.Contain("bar=baz"));
        Assert.That(result, Does.Contain("foo=override"));
        Assert.That(result, Does.Not.Contain("foo1"));
        Assert.That(result, Does.Not.Contain("foo2"));
    }

    [Test]
    public void Builder_MergeAdditional_UserProvidesMultipleValues()
    {
        // SDK generates no foo parameter
        var builder = new QueryStringBuilder.Builder().Add("bar", "baz");

        // User provides foo=bar1&foo=bar2 in AdditionalQueryParameters
        var additional = new List<KeyValuePair<string, string>>
        {
            new("foo", "bar1"),
            new("foo", "bar2"),
        };

        var result = builder.MergeAdditional(additional).Build();

        // Result should be bar=baz&foo=bar1&foo=bar2
        Assert.That(result, Does.Contain("bar=baz"));
        Assert.That(result, Does.Contain("foo=bar1"));
        Assert.That(result, Does.Contain("foo=bar2"));
    }

    [Test]
    public void Builder_Add_WithCollection_CreatesMultipleParameters()
    {
        var tags = new[] { "tag1", "tag2", "tag3" };
        var result = new QueryStringBuilder.Builder().Add("tag", tags).Build();

        Assert.That(result, Does.Contain("tag=tag1"));
        Assert.That(result, Does.Contain("tag=tag2"));
        Assert.That(result, Does.Contain("tag=tag3"));
    }

    [Test]
    public void Builder_Add_WithList_CreatesMultipleParameters()
    {
        var ids = new List<int> { 1, 2, 3 };
        var result = new QueryStringBuilder.Builder().Add("id", ids).Build();

        Assert.That(result, Does.Contain("id=1"));
        Assert.That(result, Does.Contain("id=2"));
        Assert.That(result, Does.Contain("id=3"));
    }

    [Test]
    public void Builder_Set_WithCollection_ReplacesAllPreviousValues()
    {
        var result = new QueryStringBuilder.Builder()
            .Add("id", 1)
            .Add("id", 2)
            .Set("id", new[] { 10, 20, 30 })
            .Build();

        Assert.That(result, Does.Contain("id=10"));
        Assert.That(result, Does.Contain("id=20"));
        Assert.That(result, Does.Contain("id=30"));
        // Check that old values are not present (use word boundaries to avoid false positives with id=10)
        Assert.That(result, Does.Not.Contain("id=1&"));
        Assert.That(result, Does.Not.Contain("id=2&"));
        Assert.That(result, Does.Not.Contain("id=1?"));
        Assert.That(result, Does.Not.Contain("id=2?"));
        Assert.That(result, Does.Not.EndWith("id=1"));
        Assert.That(result, Does.Not.EndWith("id=2"));
    }
}
