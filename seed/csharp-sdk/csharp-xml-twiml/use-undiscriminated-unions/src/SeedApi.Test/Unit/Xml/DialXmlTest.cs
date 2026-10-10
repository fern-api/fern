using NUnit.Framework;

namespace SeedApi.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DialXmlTest
{
    [NUnit.Framework.Test]
    public void FromXml_ToXml_RoundTrips()
    {
        var xml =
            "<tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\" statusCallbackEvent=\"statusCallbackEvent statusCallbackEvent-2\" record=\"record-from-answer record-from-ringing\">text<Numbers><Number /></Numbers></tw:Dial>";
        var parsed = global::SeedApi.Dial.FromXml(xml);
        Assert.That(parsed.Number, Is.EqualTo("text"), "Number");
        Assert.That(
            parsed.StatusCallbackEvent,
            Is.EqualTo(new[] { "statusCallbackEvent", "statusCallbackEvent-2" }),
            "StatusCallbackEvent"
        );
        Assert.That(
            parsed.Record,
            Is.EqualTo(
                new[]
                {
                    new global::SeedApi.DialRecordItem("record-from-answer"),
                    new global::SeedApi.DialRecordItem("record-from-ringing"),
                }
            ),
            "Record"
        );
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain(">text<"));
        Assert.That(
            serialized,
            Does.Contain("statusCallbackEvent=\"statusCallbackEvent statusCallbackEvent-2\"")
        );
        Assert.That(serialized, Does.Contain("record=\"record-from-answer record-from-ringing\""));
        Assert.That(
            global::SeedApi.Dial.FromXml(serialized).ToXml(false),
            Is.EqualTo(serialized),
            "re-serializing the parsed document is stable"
        );
        Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\"1.0\""));
        Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));
    }

    [NUnit.Framework.Test]
    public void FromXml_PreservesUnknownAttributesAndChildren()
    {
        var parsed = global::SeedApi.Dial.FromXml(
            "<tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\" data-unknown=\"1\"><Unknown a=\"1\">v</Unknown></tw:Dial>"
        );
        Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));
        Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));
        Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));
        var serialized = parsed.ToXml(false);
        Assert.That(serialized, Does.Contain("data-unknown=\"1\""));
        Assert.That(serialized, Does.Contain("<Unknown a=\"1\">v</Unknown>"));
        Assert.That(global::SeedApi.Dial.FromXml(serialized).ToXml(false), Is.EqualTo(serialized));
    }

    [NUnit.Framework.Test]
    public void ToXml_EscapesSpecialCharacters()
    {
        var model = new global::SeedApi.Dial { Number = "a & b < c > d \"q\" 'r'" };
        var serialized = model.ToXml(false);
        Assert.That(serialized, Does.Not.Contain("a & b"));
        Assert.That(serialized, Does.Not.Contain("< c"));
        Assert.That(
            global::SeedApi.Dial.FromXml(serialized).Number,
            Is.EqualTo("a & b < c > d \"q\" 'r'")
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsWrongRootElement()
    {
        Assert.That(
            () => global::SeedApi.Dial.FromXml("<NotThetw:Dial />"),
            Throws.ArgumentException
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.That(
            () =>
                global::SeedApi.Dial.FromXml(
                    "<tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\"><unclosed>"
                ),
            Throws.ArgumentException
        );
    }

    [NUnit.Framework.Test]
    public void FromXml_RejectsDoctype()
    {
        Assert.That(
            () =>
                global::SeedApi.Dial.FromXml(
                    "<!DOCTYPE tw:Dial [<!ENTITY xxe \"injected\">]><tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\">&xxe;</tw:Dial>"
                ),
            Throws.ArgumentException
        );
    }
}
