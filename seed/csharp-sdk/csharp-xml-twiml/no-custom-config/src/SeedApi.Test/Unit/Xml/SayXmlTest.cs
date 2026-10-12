using NUnit.Framework;

namespace SeedApi.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SayXmlTest
{
    [NUnit.Framework.Test]
    public void FromXml_ToXml_RoundTrips()
    {
        var xml = "<Say voice=\"voice\" loop=\"1\">text<break /></Say>";
        var parsed = Say.FromXml(xml);
        Assert.That(parsed.Message, Is.EqualTo("text"), "Message");
        Assert.That(parsed.Voice, Is.EqualTo("voice"), "Voice");
        Assert.That(parsed.Loop, Is.EqualTo(1), "Loop");
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain(">text<"));
        Assert.That(serialized, Does.Contain("voice=\"voice\""));
        Assert.That(serialized, Does.Contain("loop=\"1\""));
        Assert.That(
            Say.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized),
            "re-serializing the parsed document is stable"
        );
        Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\"1.0\""));
        Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesUnknownAttributesAndChildren()
    {
        var parsed = Say.FromXml("<Say data-unknown=\"1\"><Unknown a=\"1\">v</Unknown></Say>");
        Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));
        Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));
        Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("data-unknown=\"1\""));
        Assert.That(serialized, Does.Contain("<Unknown a=\"1\">v</Unknown>"));
        Assert.That(Say.FromXml(serialized).ToXml(false), Is.EqualTo(serialized));
    }

    [NUnit.Framework.Test]
    public void ToXml_EscapesSpecialCharacters()
    {
        var model = new Say { Message = "a & b < c > d \"q\" 'r'" };
        var serialized = model.ToXml(false);
        Assert.That(serialized, Does.Not.Contain("a & b"));
        Assert.That(serialized, Does.Not.Contain("< c"));
        Assert.That(Say.FromXml(serialized).Message, Is.EqualTo("a & b < c > d \"q\" 'r'"));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesChildOrder()
    {
        var parsed = Say.FromXml("<Say>a<break />b</Say>");
        Assert.That(parsed.ToXml(false), Does.Contain("a<break />b"));
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsWrongRootElement()
    {
        Assert.That(() => Say.FromXml("<NotTheSay />"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.That(() => Say.FromXml("<Say><unclosed>"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsDoctype()
    {
        Assert.That(
            () => Say.FromXml("<!DOCTYPE Say [<!ENTITY xxe \"injected\">]><Say>&xxe;</Say>"),
            Throws.ArgumentException
        );
    }
}
