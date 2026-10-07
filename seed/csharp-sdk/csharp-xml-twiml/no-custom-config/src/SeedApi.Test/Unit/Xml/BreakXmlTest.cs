using NUnit.Framework;

namespace SeedApi.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class BreakXmlTest
{
    [NUnit.Framework.Test]
    public void FromXml_ToXml_RoundTrips()
    {
        var xml = "<break strength=\"none\" time=\"time\" />";
        var parsed = global::SeedApi.Break.FromXml(xml);
        Assert.That(
            parsed.Strength,
            Is.EqualTo(new global::SeedApi.BreakStrength("none")),
            "Strength"
        );
        Assert.That(parsed.Time, Is.EqualTo("time"), "Time");
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("strength=\"none\""));
        Assert.That(serialized, Does.Contain("time=\"time\""));
        Assert.That(
            global::SeedApi.Break.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized),
            "re-serializing the parsed document is stable"
        );
        Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\"1.0\""));
        Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesUnknownAttributesAndChildren()
    {
        var parsed = global::SeedApi.Break.FromXml(
            "<break data-unknown=\"1\"><Unknown a=\"1\">v</Unknown></break>"
        );
        Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));
        Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));
        Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("data-unknown=\"1\""));
        Assert.That(serialized, Does.Contain("<Unknown a=\"1\">v</Unknown>"));
        Assert.That(global::SeedApi.Break.FromXml(serialized).ToXml(false), Is.EqualTo(serialized));
    }

    [NUnit.Framework.Test]
    public void ToXml_EscapesSpecialCharacters()
    {
        var model = new global::SeedApi.Break { Time = "a & b < c > d \"q\" 'r'" };
        var serialized = model.ToXml(false);
        Assert.That(serialized, Does.Not.Contain("a & b"));
        Assert.That(serialized, Does.Not.Contain("< c"));
        Assert.That(
            global::SeedApi.Break.FromXml(serialized).Time,
            Is.EqualTo("a & b < c > d \"q\" 'r'")
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_KeepsUnknownEnumValues()
    {
        var parsed = global::SeedApi.Break.FromXml("<break strength=\"bogus-value\" />");
        Assert.That(parsed.ToXml(false), Does.Contain("strength=\"bogus-value\""));
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsWrongRootElement()
    {
        Assert.That(
            () => global::SeedApi.Break.FromXml("<NotThebreak />"),
            Throws.ArgumentException
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.That(
            () => global::SeedApi.Break.FromXml("<break><unclosed>"),
            Throws.ArgumentException
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsDoctype()
    {
        Assert.That(
            () =>
                global::SeedApi.Break.FromXml(
                    "<!DOCTYPE break [<!ENTITY xxe \"injected\">]><break>&xxe;</break>"
                ),
            Throws.ArgumentException
        );
    }
}
