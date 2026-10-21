using NUnit.Framework;

namespace SeedApi.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NumberXmlTest
{
    [NUnit.Framework.Test]
    public void FromXml_ToXml_RoundTrips()
    {
        var xml = "<Number sendDigits=\"sendDigits\">text</Number>";
        var parsed = Number.FromXml(xml);
        Assert.That(parsed.PhoneNumber, Is.EqualTo("text"), "PhoneNumber");
        Assert.That(parsed.SendDigits, Is.EqualTo("sendDigits"), "SendDigits");
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain(">text<"));
        Assert.That(serialized, Does.Contain("sendDigits=\"sendDigits\""));
        Assert.That(
            Number.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized),
            "re-serializing the parsed document is stable"
        );
        Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\"1.0\""));
        Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesUnknownAttributesAndChildren()
    {
        var parsed = Number.FromXml(
            "<Number data-unknown=\"1\"><Unknown a=\"1\">v</Unknown></Number>"
        );
        Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));
        Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));
        Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("data-unknown=\"1\""));
        Assert.That(serialized, Does.Contain("<Unknown a=\"1\">v</Unknown>"));
        Assert.That(Number.FromXml(serialized).ToXml(false), Is.EqualTo(serialized));
    }

    [NUnit.Framework.Test]
    public void ToXml_EscapesSpecialCharacters()
    {
        var model = new Number { PhoneNumber = "a & b < c > d \"q\" 'r'" };
        var serialized = model.ToXml(false);
        Assert.That(serialized, Does.Not.Contain("a & b"));
        Assert.That(serialized, Does.Not.Contain("< c"));
        Assert.That(Number.FromXml(serialized).PhoneNumber, Is.EqualTo("a & b < c > d \"q\" 'r'"));
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsWrongRootElement()
    {
        Assert.That(() => Number.FromXml("<NotTheNumber />"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.That(() => Number.FromXml("<Number><unclosed>"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsDoctype()
    {
        Assert.That(
            () =>
                Number.FromXml(
                    "<!DOCTYPE Number [<!ENTITY xxe \"injected\">]><Number>&xxe;</Number>"
                ),
            Throws.ArgumentException
        );
    }
}
