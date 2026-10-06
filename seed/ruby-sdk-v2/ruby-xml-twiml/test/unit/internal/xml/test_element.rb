# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::Xml::Element do
  XmlTestElement = Seed::Internal::Xml::Element
  XmlTestUtils = Seed::Internal::Xml::Utils
  XmlTestText = Seed::Internal::Xml::Text
  XmlTestComment = Seed::Internal::Xml::Comment

  describe "#to_xml" do
    it "serializes attributes, text and children with escaping" do
      element = XmlTestElement.new("Say", text: "a < b & \"c\"", attributes: { "voice" => "man", "note" => "x\"y" })
      element.add_child(XmlTestElement.new("break", attributes: { "time" => "1s" }))

      assert_equal "<Say voice=\"man\" note=\"x&quot;y\">a &lt; b &amp; \"c\"<break time=\"1s\"/></Say>", element.to_xml
    end

    it "self-closes empty elements and prepends the declaration on request" do
      assert_equal "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Hangup/>", XmlTestElement.new("Hangup").to_xml(xml_declaration: true)
    end

    it "declares namespaces once and resets an inherited default namespace" do
      root = XmlTestElement.new("Dial", namespace: "urn:twiml", prefix: "tw")
      root.add_child(XmlTestElement.new("Number", text: "1", namespace: "urn:twiml", prefix: "tw"))
      root.add_child(XmlTestElement.new("Other"))

      assert_equal "<tw:Dial xmlns:tw=\"urn:twiml\"><tw:Number>1</tw:Number><Other/></tw:Dial>", root.to_xml

      default = XmlTestElement.new("Root", namespace: "urn:default")
      default.add_child(XmlTestElement.new("Plain"))

      assert_equal "<Root xmlns=\"urn:default\"><Plain xmlns=\"\"/></Root>", default.to_xml
    end
  end

  describe ".parse_document" do
    it "round-trips a document" do
      xml = "<tw:Dial xmlns:tw=\"urn:twiml\" callerId=\"+1\"><Numbers><Number sendDigits=\"1\">+2</Number></Numbers>" \
            "<x:Extra xmlns:x=\"urn:x\" x:kind=\"k\">t &amp; u</x:Extra></tw:Dial>"
      element = XmlTestUtils.parse_document(xml)

      assert_equal "Dial", element.name
      assert_equal "urn:twiml", element.namespace
      assert_equal "tw", element.prefix
      assert_equal({ "callerId" => "+1" }, element.attributes)
      assert_equal "+2", element.child("Numbers").child("Number").text
      assert_equal "t & u", element.child("Extra").text
      assert_equal({ "x:kind" => "k" }, element.child("Extra").attributes)
      assert_equal xml, element.to_xml
    end

    it "rejects empty, malformed and DOCTYPE documents" do
      assert_raises(ArgumentError) { XmlTestUtils.parse_document("   ") }
      assert_raises(ArgumentError) { XmlTestUtils.parse_document("<Say>") }
      assert_raises(ArgumentError) { XmlTestUtils.parse_document("<!DOCTYPE x [<!ENTITY e SYSTEM \"file:///etc/passwd\">]><Say>&e;</Say>") }
    end

    it "checks the root element name and explicit namespace" do
      assert_raises(ArgumentError) { XmlTestUtils.parse_root("<Dial/>", "Response") }
      assert_raises(ArgumentError) { XmlTestUtils.parse_root("<Response xmlns=\"urn:other\"/>", "Response", "urn:twiml") }
      assert_equal "Response", XmlTestUtils.parse_root("<Response/>", "Response", "urn:twiml").name
    end
  end

  describe "mixed content" do
    it "writes text segments and children in insertion order" do
      say = XmlTestElement.new("Say", text: "Hi ")
      say.add_child(XmlTestElement.new("break", attributes: { "strength" => "weak" }))
      say.add_text(" world")

      assert_equal "<Say>Hi <break strength=\"weak\"/> world</Say>", say.to_xml
    end

    it "parses text between and after children in document order and round-trips it" do
      xml = "<Response><Say>Hi <break strength=\"weak\"/> world</Say><Custom/><Say>b</Say>tail</Response>"
      element = XmlTestUtils.parse_document(xml)

      assert_nil element.text
      assert_equal %w[Say Custom Say], element.child_elements.map(&:name)
      assert_kind_of XmlTestText, element.children.last
      assert_equal "tail", element.children.last.value
      assert_equal "Hi ", element.child("Say").text
      assert_equal xml, element.to_xml
    end

    it "drops indentation between children when parsing" do
      element = XmlTestUtils.parse_document("<Response>\n  <Say>a</Say>\n  <Say>b</Say>\n</Response>")

      assert_equal "<Response><Say>a</Say><Say>b</Say></Response>", element.to_xml
    end

    it "add_content follows the content order and appends missing typed children" do
      a = XmlTestElement.new("Say", text: "a")
      b = XmlTestElement.new("Say", text: "b")
      custom = XmlTestElement.new("Custom")
      late = XmlTestElement.new("Say", text: "c")
      element = XmlTestElement.new("Response")
      XmlTestUtils.add_content(element, [a, custom, b, XmlTestText.new("x")], [a, b, late], {}, [custom])

      assert_equal "<Response><Say>a</Say><Custom/><Say>b</Say>x<Say>c</Say></Response>", element.to_xml
    end

    it "add_content merges a raw wrapper element into the wrapped list's wrapper" do
      number = XmlTestElement.new("Number", text: "1")
      raw = XmlTestElement.new("Numbers", attributes: { "kind" => "x" })
      raw.add_child(XmlTestElement.new("Other"))
      element = XmlTestElement.new("Dial")
      XmlTestUtils.add_content(element, [number, raw], [], { "Numbers" => [number] }, [raw])

      assert_equal '<Dial><Numbers kind="x"><Number>1</Number><Other/></Numbers></Dial>', element.to_xml

      element = XmlTestElement.new("Dial")
      XmlTestUtils.add_content(element, [raw, number], [], { "Numbers" => [number] }, [raw])

      assert_equal '<Dial><Numbers kind="x"><Number>1</Number><Other/></Numbers></Dial>', element.to_xml
    end

    it "add_content places a wrapped list where its first item or wrapper appears" do
      number = XmlTestElement.new("Number", text: "1")
      custom = XmlTestElement.new("Custom")
      element = XmlTestElement.new("Dial")
      XmlTestUtils.add_content(element, [number, custom], [], { "Numbers" => [number] }, [custom])

      assert_equal "<Dial><Numbers><Number>1</Number></Numbers><Custom/></Dial>", element.to_xml

      parsed = XmlTestUtils.parse_document("<Dial><Numbers><Number>1</Number></Numbers><Unknown/></Dial>")
      additional = XmlTestUtils.additional_children(parsed, [], { "Numbers" => ["Number"] })
      content = XmlTestUtils.content(parsed, [], additional, ["Numbers"])
      rebuilt = XmlTestElement.new("Dial")
      XmlTestUtils.add_content(rebuilt, content, [], { "Numbers" => [XmlTestElement.new("Number", text: "1")] }, additional)

      assert_equal "<Dial><Numbers><Number>1</Number></Numbers><Unknown/></Dial>", rebuilt.to_xml
    end

    it "content matches typed children to parsed elements in document order" do
      parsed = XmlTestUtils.parse_document("<Response><Say>a</Say><Custom/><Say>b</Say>tail</Response>")
      additional = XmlTestUtils.additional_children(parsed, ["Say"])
      first = XmlTestElement.new("Say", text: "A")
      second = XmlTestElement.new("Say", text: "B")
      content = XmlTestUtils.content(parsed, [[["Say"], [first, second]]], additional)

      assert_equal 4, content.length
      assert_same first, content[0]
      assert_same additional[0], content[1]
      assert_same second, content[2]
      assert_equal "tail", content[3].value
    end
  end

  describe "scalar parsing" do
    it "parses and validates values" do
      assert_equal 3, XmlTestUtils.parse_integer(" 3 ")
      assert_in_delta 1.5, XmlTestUtils.parse_float("1.5")
      assert XmlTestUtils.parse_boolean("1")
      refute XmlTestUtils.parse_boolean("false")
      assert_equal %w[a b], XmlTestUtils.parse_list("a  b", " ") { |item| item }
      assert_equal %w[a b], XmlTestUtils.parse_list("a,,b", ",") { |item| item }
      assert_equal "yes", XmlTestUtils.parse_literal("yes", "yes")
      assert_raises(ArgumentError) { XmlTestUtils.parse_integer("x") }
      assert_raises(ArgumentError) { XmlTestUtils.parse_boolean("maybe") }
      assert_raises(ArgumentError) { XmlTestUtils.parse_literal("no", "yes") }
    end
  end

  describe "comments" do
    it "keeps comments in their position in the content" do
      element = XmlTestElement.new("Response").add_comment(" a comment ").add_child(XmlTestElement.new("Hangup")).add_text("loose text")

      assert_equal "<Response><!-- a comment --><Hangup/>loose text</Response>", element.to_xml

      parsed = XmlTestUtils.parse_document(element.to_xml)

      assert_equal 3, parsed.children.length
      assert_equal XmlTestComment.new(" a comment "), parsed.children[0]
      assert_equal element.to_xml, parsed.to_xml
      assert_equal element, parsed

      say = XmlTestUtils.parse_document("<Say><!--x-->text</Say>")

      assert_nil say.text
      assert_equal "<Say><!--x-->text</Say>", say.to_xml
    end

    it "renders sibling comments around their element" do
      say = XmlTestElement.new("Say", text: "x")
      say.add_child(XmlTestComment.before("before")).add_child(XmlTestComment.after("after"))
      response = XmlTestElement.new("Response").add_child(XmlTestElement.new("Pause")).add_child(say)

      assert_equal "<Response><Pause/><!--before--><Say>x</Say><!--after--></Response>", response.to_xml
      assert_equal "#{XmlTestUtils::XML_DECLARATION}<!--before--><Say>x</Say><!--after-->", say.to_xml(xml_declaration: true)
      assert_empty say.child_elements

      empty = XmlTestElement.new("Hangup").add_child(XmlTestComment.after("done"))

      assert_equal "<Hangup/><!--done-->", empty.to_xml
    end

    it "rejects an unterminated comment" do
      assert_raises(ArgumentError) { XmlTestUtils.parse_document("<Response><!-- oops </Response>") }
    end

    it "keeps comment text from closing the comment early" do
      element = XmlTestElement.new("Response").add_comment("a -- b --> <Hangup/> -")
      assert_equal "<Response><!--a - - b - -> <Hangup/> - --></Response>", XmlTestUtils.serialize(element)
      parsed = XmlTestUtils.parse_document(XmlTestUtils.serialize(element))
      assert_equal [XmlTestComment.new("a - - b - -> <Hangup/> - ")], parsed.children
    end
  end
end
