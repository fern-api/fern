using NUnit.Framework;
using SeedOauthClientCredentialsReference.Core;

namespace SeedOauthClientCredentialsReference.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class QueryParameterTests
{
    [Test]
    public void QueryParameters_BasicParameters()
    {
        var queryString = new QueryStringBuilder.Builder()
            .Add("foo", "bar")
            .Add("baz", "qux")
            .Build();

        Assert.That(queryString, Is.EqualTo("?foo=bar&baz=qux"));
    }

    [Test]
    public void QueryParameters_SpecialCharacterEscaping()
    {
        var queryString = new QueryStringBuilder.Builder()
            .Add("email", "bob+test@example.com")
            .Add("%Complete", "100")
            .Add("space test", "hello world")
            .Build();

        Assert.That(queryString, Does.Contain("email=bob%2Btest%40example.com"));
        Assert.That(queryString, Does.Contain("%25Complete=100"));
        Assert.That(queryString, Does.Contain("space%20test=hello%20world"));
    }

    [Test]
    public void QueryParameters_MergeAdditionalParameters()
    {
        var queryString = new QueryStringBuilder.Builder()
            .Add("sdk", "param")
            .MergeAdditional(new List<KeyValuePair<string, string>> { new("user", "value") })
            .Build();

        Assert.That(queryString, Does.Contain("sdk=param"));
        Assert.That(queryString, Does.Contain("user=value"));
    }

    [Test]
    public void QueryParameters_AdditionalOverridesSdk()
    {
        var queryString = new QueryStringBuilder.Builder()
            .Add("foo", "sdk_value")
            .MergeAdditional(new List<KeyValuePair<string, string>> { new("foo", "user_override") })
            .Build();

        Assert.That(queryString, Does.Contain("foo=user_override"));
        Assert.That(queryString, Does.Not.Contain("sdk_value"));
    }

    [Test]
    public void QueryParameters_AdditionalMultipleValues()
    {
        var queryString = new QueryStringBuilder.Builder()
            .Add("foo", "sdk_value")
            .MergeAdditional(
                new List<KeyValuePair<string, string>> { new("foo", "user1"), new("foo", "user2") }
            )
            .Build();

        Assert.That(queryString, Does.Contain("foo=user1"));
        Assert.That(queryString, Does.Contain("foo=user2"));
        Assert.That(queryString, Does.Not.Contain("sdk_value"));
    }

    [Test]
    public void QueryParameters_OnlyAdditionalParameters()
    {
        var queryString = new QueryStringBuilder.Builder()
            .MergeAdditional(
                new List<KeyValuePair<string, string>> { new("foo", "bar"), new("baz", "qux") }
            )
            .Build();

        Assert.That(queryString, Does.Contain("foo=bar"));
        Assert.That(queryString, Does.Contain("baz=qux"));
    }

    [Test]
    public void QueryParameters_EmptyAdditionalParameters()
    {
        var queryString = new QueryStringBuilder.Builder()
            .Add("foo", "bar")
            .MergeAdditional(new List<KeyValuePair<string, string>>())
            .Build();

        Assert.That(queryString, Is.EqualTo("?foo=bar"));
    }

    [Test]
    public void QueryParameters_NullAdditionalParameters()
    {
        var queryString = new QueryStringBuilder.Builder()
            .Add("foo", "bar")
            .MergeAdditional(null)
            .Build();

        Assert.That(queryString, Is.EqualTo("?foo=bar"));
    }
}
