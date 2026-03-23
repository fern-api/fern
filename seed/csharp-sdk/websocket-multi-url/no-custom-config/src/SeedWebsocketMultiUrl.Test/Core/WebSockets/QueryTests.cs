using NUnit.Framework;
using SeedWebsocketMultiUrl.Core.WebSockets;

namespace SeedWebsocketMultiUrl.Test.Core.WebSockets;

[TestFixture]
public class QueryTests
{
    [Test]
    public void Empty_ReturnsEmptyString()
    {
        var query = new Query();

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddString_ProducesQueryParam()
    {
        var query = new Query();
        query.Add("key", "value");

        Assert.That(query.ToString(), Is.EqualTo("key=value"));
    }

    [Test]
    public void AddMultipleParams_JoinedWithAmpersand()
    {
        var query = new Query();
        query.Add("a", "1");
        query.Add("b", "2");

        Assert.That(query.ToString(), Is.EqualTo("a=1&b=2"));
    }

    [Test]
    public void AddString_NullValue_Skipped()
    {
        var query = new Query();
        query.Add("key", (string?)null);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddString_EmptyValue_Skipped()
    {
        var query = new Query();
        query.Add("key", "");

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddString_NullKey_Skipped()
    {
        var query = new Query();
        query.Add(null!, "value");

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddInt_ProducesQueryParam()
    {
        var query = new Query();
        query.Add("count", 42);

        Assert.That(query.ToString(), Is.EqualTo("count=42"));
    }

    [Test]
    public void AddInt_Null_Skipped()
    {
        var query = new Query();
        query.Add("count", (int?)null);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddBool_ProducesLowercase()
    {
        var query = new Query();
        query.Add("enabled", true);

        Assert.That(query.ToString(), Is.EqualTo("enabled=true"));
    }

    [Test]
    public void AddBool_False()
    {
        var query = new Query();
        query.Add("enabled", false);

        Assert.That(query.ToString(), Is.EqualTo("enabled=false"));
    }

    [Test]
    public void AddBool_Null_Skipped()
    {
        var query = new Query();
        query.Add("enabled", (bool?)null);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddFloat_ProducesQueryParam()
    {
        var query = new Query();
        query.Add("rate", 1.5f);

        Assert.That(query.ToString(), Does.StartWith("rate=1.5"));
    }

    [Test]
    public void AddDouble_ProducesQueryParam()
    {
        var query = new Query();
        query.Add("pi", 3.14159);

        Assert.That(query.ToString(), Does.StartWith("pi=3.14159"));
    }

    [Test]
    public void AddDecimal_ProducesQueryParam()
    {
        var query = new Query();
        query.Add("price", 19.99m);

        Assert.That(query.ToString(), Is.EqualTo("price=19.99"));
    }

    [Test]
    public void AddObject_ProducesQueryParam()
    {
        var query = new Query();
        query.Add("obj", (object)"hello");

        Assert.That(query.ToString(), Is.EqualTo("obj=hello"));
    }

    [Test]
    public void AddObject_Null_Skipped()
    {
        var query = new Query();
        query.Add("obj", (object?)null);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void UrlEncoding_EscapesSpecialCharacters()
    {
        var query = new Query();
        query.Add("name", "hello world");

        Assert.That(query.ToString(), Is.EqualTo("name=hello%20world"));
    }

    [Test]
    public void UrlEncoding_EscapesAmpersandInValue()
    {
        var query = new Query();
        query.Add("q", "a&b");

        Assert.That(query.ToString(), Is.EqualTo("q=a%26b"));
    }

    [Test]
    public void ImplicitStringConversion()
    {
        var query = new Query();
        query.Add("x", "1");

        string result = query;

        Assert.That(result, Is.EqualTo("x=1"));
    }

    [Test]
    public void Enumerable_IteratesParameters()
    {
        var query = new Query();
        query.Add("a", "1");
        query.Add("b", "2");

        var pairs = query.ToList();

        Assert.That(pairs.Count, Is.EqualTo(2));
        Assert.That(pairs[0].Key, Is.EqualTo("a"));
        Assert.That(pairs[0].Value, Is.EqualTo("1"));
        Assert.That(pairs[1].Key, Is.EqualTo("b"));
        Assert.That(pairs[1].Value, Is.EqualTo("2"));
    }

    [Test]
    public void Create_ReturnsNewInstance()
    {
        var query = Query.Create();

        Assert.That(query, Is.Not.Null);
        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddFloat_Null_Skipped()
    {
        var query = new Query();
        query.Add("rate", (float?)null);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddDouble_Null_Skipped()
    {
        var query = new Query();
        query.Add("pi", (double?)null);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddDecimal_Null_Skipped()
    {
        var query = new Query();
        query.Add("price", (decimal?)null);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddInt_EmptyKey_Skipped()
    {
        var query = new Query();
        query.Add("", 42);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddBool_EmptyKey_Skipped()
    {
        var query = new Query();
        query.Add("", true);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddFloat_EmptyKey_Skipped()
    {
        var query = new Query();
        query.Add("", 1.5f);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddDouble_EmptyKey_Skipped()
    {
        var query = new Query();
        query.Add("", 3.14);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddDecimal_EmptyKey_Skipped()
    {
        var query = new Query();
        query.Add("", 19.99m);

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void AddObject_EmptyKey_Skipped()
    {
        var query = new Query();
        query.Add("", (object)"hello");

        Assert.That(query.ToString(), Is.EqualTo(""));
    }

    [Test]
    public void NonGenericEnumerator_Works()
    {
        var query = new Query();
        query.Add("a", "1");

        var enumerable = (global::System.Collections.IEnumerable)query;
        var enumerator = enumerable.GetEnumerator();
        Assert.That(enumerator.MoveNext(), Is.True);
        Assert.That(enumerator.Current, Is.InstanceOf<KeyValuePair<string, string>>());
    }
}
