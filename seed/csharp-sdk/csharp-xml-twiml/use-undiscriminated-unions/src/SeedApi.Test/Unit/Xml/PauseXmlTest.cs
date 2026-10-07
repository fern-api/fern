using NUnit.Framework;

namespace SeedApi.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PauseXmlTest
{
    [NUnit.Framework.Test]
    public void FromXml_ToXml_RoundTrips()
    {
        var xml = "<Pause length=\"1\" />";
        var parsed = Pause.FromXml(xml);
        Assert.That(parsed.Length, Is.EqualTo(1), "Length");
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("length=\"1\""));
        Assert.That(
            Pause.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized),
            "re-serializing the parsed document is stable"
        );
        Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\"1.0\""));
        Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesUnknownAttributesAndChildren()
    {
        var parsed = Pause.FromXml(
            "<Pause data-unknown=\"1\"><Unknown a=\"1\">v</Unknown></Pause>"
        );
        Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));
        Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));
        Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("data-unknown=\"1\""));
        Assert.That(serialized, Does.Contain("<Unknown a=\"1\">v</Unknown>"));
        Assert.That(Pause.FromXml(serialized).ToXml(false), Is.EqualTo(serialized));
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsWrongRootElement()
    {
        Assert.That(() => Pause.FromXml("<NotThePause />"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.That(() => Pause.FromXml("<Pause><unclosed>"), Throws.ArgumentException);
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsDoctype()
    {
        Assert.That(
            () =>
                Pause.FromXml("<!DOCTYPE Pause [<!ENTITY xxe \"injected\">]><Pause>&xxe;</Pause>"),
            Throws.ArgumentException
        );
    }
}
