using NUnit.Framework;

namespace SeedApi.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ResponseXmlTest
{
    [NUnit.Framework.Test]
    public void FromXml_ToXml_RoundTrips()
    {
        var xml = "<Response><Say /></Response>";
        var parsed = global::SeedApi.Response.FromXml(xml);
        var serialized = parsed.ToXml(false);
        Assert.That(
            global::SeedApi.Response.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized),
            "re-serializing the parsed document is stable"
        );
        Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\"1.0\""));
        Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesUnknownAttributesAndChildren()
    {
        var parsed = global::SeedApi.Response.FromXml(
            "<Response data-unknown=\"1\"><Unknown a=\"1\">v</Unknown></Response>"
        );
        Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));
        Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));
        Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("data-unknown=\"1\""));
        Assert.That(serialized, Does.Contain("<Unknown a=\"1\">v</Unknown>"));
        Assert.That(
            global::SeedApi.Response.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized)
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesChildOrder()
    {
        var parsed = global::SeedApi.Response.FromXml(
            "<Response><Say /><Pause /><Say /></Response>"
        );
        Assert.That(parsed.ToXml(false), Does.Contain("<Say /><Pause /><Say />"));
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsWrongRootElement()
    {
        Assert.That(
            () => global::SeedApi.Response.FromXml("<NotTheResponse />"),
            Throws.ArgumentException
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.That(
            () => global::SeedApi.Response.FromXml("<Response><unclosed>"),
            Throws.ArgumentException
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsDoctype()
    {
        Assert.That(
            () =>
                global::SeedApi.Response.FromXml(
                    "<!DOCTYPE Response [<!ENTITY xxe \"injected\">]><Response>&xxe;</Response>"
                ),
            Throws.ArgumentException
        );
    }
}
