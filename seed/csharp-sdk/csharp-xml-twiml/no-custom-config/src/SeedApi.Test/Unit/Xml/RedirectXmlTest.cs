using NUnit.Framework;

namespace SeedApi.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class RedirectXmlTest
{
    [NUnit.Framework.Test]
    public void FromXml_ToXml_RoundTrips()
    {
        var xml = "<Redirect method=\"method\">text</Redirect>";
        var parsed = Redirect.FromXml(xml);
        Assert.That(parsed.Url, Is.EqualTo("text"), "Url");
        Assert.That(parsed.Method, Is.EqualTo("method"), "Method");
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain(">text<"));
        Assert.That(serialized, Does.Contain("method=\"method\""));
        Assert.That(
            Redirect.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized),
            "re-serializing the parsed document is stable"
        );
        Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\"1.0\""));
        Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesUnknownAttributesAndChildren()
    {
        var parsed = Redirect.FromXml(
            "<Redirect method=\"method\" data-unknown=\"1\">text<Unknown a=\"1\">v</Unknown></Redirect>"
        );
        Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));
        Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));
        Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("data-unknown=\"1\""));
        Assert.That(serialized, Does.Contain("<Unknown a=\"1\">v</Unknown>"));
        Assert.That(Redirect.FromXml(serialized).ToXml(false), Is.EqualTo(serialized));
    }

    [NUnit.Framework.Test]
    public void ToXml_EscapesSpecialCharacters()
    {
        var model = new Redirect { Url = "a & b < c > d \"q\" 'r'", Method = "method" };
        var serialized = model.ToXml(false);
        Assert.That(serialized, Does.Not.Contain("a & b"));
        Assert.That(serialized, Does.Not.Contain("< c"));
        Assert.That(Redirect.FromXml(serialized).Url, Is.EqualTo("a & b < c > d \"q\" 'r'"));
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsWrongRootElement()
    {
        Assert.That(() => Redirect.FromXml("<NotTheRedirect />"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.That(() => Redirect.FromXml("<Redirect><unclosed>"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsDoctype()
    {
        Assert.That(
            () =>
                Redirect.FromXml(
                    "<!DOCTYPE Redirect [<!ENTITY xxe \"injected\">]><Redirect>&xxe;</Redirect>"
                ),
            Throws.ArgumentException
        );
    }
}
