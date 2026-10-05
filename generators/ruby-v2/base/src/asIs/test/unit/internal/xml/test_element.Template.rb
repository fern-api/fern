# frozen_string_literal: true

require "test_helper"

describe <%= gem_namespace %>::Internal::Xml::Element do
  XmlTestElement = <%= gem_namespace %>::Internal::Xml::Element
  XmlTestUtils = <%= gem_namespace %>::Internal::Xml::Utils

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
end
