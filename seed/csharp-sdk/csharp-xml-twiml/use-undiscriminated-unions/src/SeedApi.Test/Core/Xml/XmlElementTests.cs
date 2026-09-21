using global::System.Xml.Linq;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Core.Xml;

[TestFixture]
public class XmlElementTests
{
    [Test]
    public void ToXml_WritesAttributesTextAndChildren()
    {
        var element = new XmlElement("Foo", "hi <&> \"there\"")
            .SetAttribute("a", "1")
            .AddChild(new XmlElement("Bar").SetAttribute("b", "2"))
            .AddChild(new XmlElement("Baz", "x"));

        Assert.That(
            element.ToXml(),
            Is.EqualTo("<Foo a=\"1\">hi &lt;&amp;&gt; \"there\"<Bar b=\"2\" /><Baz>x</Baz></Foo>")
        );
    }

    [Test]
    public void ToXml_WritesNamespaceAndPrefix()
    {
        var element = new XmlElement("Dial", "+15551234567", "https://www.twilio.com/twiml", "tw");

        Assert.That(
            element.ToXml(),
            Is.EqualTo("<tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\">+15551234567</tw:Dial>")
        );
    }

    [Test]
    public void FromXml_RoundTrips()
    {
        const string xml =
            "<Response><Say voice=\"man\">hi</Say><tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\" xml:lang=\"en\">+1</tw:Dial><Hangup /></Response>";

        var element = XmlElement.FromXml(xml);

        Assert.That(element.Name, Is.EqualTo("Response"));
        Assert.That(element.Children, Has.Count.EqualTo(3));
        var dial = (XmlElement)element.Children[1];
        Assert.That(dial.Namespace, Is.EqualTo("https://www.twilio.com/twiml"));
        Assert.That(dial.Prefix, Is.EqualTo("tw"));
        Assert.That(dial.Attributes["xml:lang"], Is.EqualTo("en"));
        Assert.That(element.ToXml(), Is.EqualTo(xml));
        Assert.That(XmlElement.FromXml(element.ToXml()), Is.EqualTo(element));
    }

    [Test]
    public void FromXml_IgnoresDeclarationAndComments()
    {
        var element = XmlElement.FromXml(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!-- c --><Foo><!-- c -->bar</Foo>"
        );

        Assert.That(element.Name, Is.EqualTo("Foo"));
        Assert.That(element.Text, Is.EqualTo("bar"));
    }

    [Test]
    public void FromXml_RejectsMalformedXml()
    {
        Assert.Throws<ArgumentException>(() => XmlElement.FromXml("<Foo>"));
        Assert.Throws<ArgumentException>(() => XmlElement.FromXml(""));
    }

    [Test]
    public void FromXml_RejectsDoctype()
    {
        const string xml =
            "<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]><Foo>&xxe;</Foo>";

        Assert.Throws<ArgumentException>(() => XmlElement.FromXml(xml));
    }

    [Test]
    public void ParseRoot_RejectsWrongRootName()
    {
        var e = Assert.Throws<ArgumentException>(() => XmlUtils.ParseRoot("<Bar />", "Foo"));
        Assert.That(e!.Message, Does.Contain("<Foo>"));
    }

    [Test]
    public void FromXml_PreservesInheritedAttributeNamespace()
    {
        var parsed = XmlElement.FromXml("<Foo xmlns:a=\"urn:test\"><Bar a:id=\"1\"/></Foo>");
        var bar = (XmlElement)parsed.Children[0];
        Assert.That(bar.Attributes["a:id"], Is.EqualTo("1"));
        Assert.That(bar.ToXml(), Is.EqualTo("<Bar xmlns:a=\"urn:test\" a:id=\"1\" />"));
        Assert.That(XmlElement.FromXml(parsed.ToXml()), Is.EqualTo(parsed));
    }

    [Test]
    public void SetText_ReplacesExistingText()
    {
        var element = new XElement("Foo", "old");
        XmlUtils.SetText(element, "new");
        XmlUtils.SetText(element, null);
        Assert.That(XmlUtils.GetText(element), Is.EqualTo("new"));
    }

    [Test]
    public void ParseValue_ParsesScalars()
    {
        Assert.That(XmlUtils.ParseValue<int>("42"), Is.EqualTo(42));
        Assert.That(XmlUtils.ParseValue<bool>("True"), Is.True);
        Assert.That(XmlUtils.ParseValue<bool>("1"), Is.True);
        Assert.That(XmlUtils.ParseValue<bool>("0"), Is.False);
        Assert.That(XmlUtils.ParseValue<double>(" 1.5 "), Is.EqualTo(1.5));
        Assert.That(XmlUtils.ParseValue<string>("x"), Is.EqualTo("x"));
        Assert.That(XmlUtils.ParseValue<int?>(null), Is.Null);
        Assert.Throws<ArgumentException>(() => XmlUtils.ParseValue<int>("nope"));
    }

    [Test]
    public void ParseList_SplitsOnSeparator()
    {
        Assert.That(XmlUtils.ParseList<string>("a b", " "), Is.EqualTo(new[] { "a", "b" }));
        Assert.That(XmlUtils.ParseList<int>("1,2,3", ","), Is.EqualTo(new[] { 1, 2, 3 }));
        Assert.That(XmlUtils.ParseList<string>("", " "), Is.Empty);
        Assert.That(XmlUtils.ParseList<string>(null, " "), Is.Null);
        Assert.That(XmlUtils.JoinValues(new[] { 1, 2 }, " "), Is.EqualTo("1 2"));
    }

    [Test]
    public void GetAdditionalChildren_KeepsUnknownWrapperItemsOnly()
    {
        var root = XmlUtils.ParseDocument(
            "<Dial><Numbers x=\"1\"><Number>+1</Number><Extension>2</Extension></Numbers><Other /></Dial>"
        );

        var additional = XmlUtils.GetAdditionalChildren(
            root,
            new[] { "Numbers" },
            new Dictionary<string, string[]> { { "Numbers", new[] { "Number" } } }
        );

        Assert.That(
            additional.Select(c => c.ToXml()),
            Is.EqualTo(new[] { "<Numbers x=\"1\"><Extension>2</Extension></Numbers>", "<Other />" })
        );
    }
}
