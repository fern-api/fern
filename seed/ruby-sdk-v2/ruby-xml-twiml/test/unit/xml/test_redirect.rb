# frozen_string_literal: true

require "test_helper"

describe Seed::Types::Redirect do
  it "round-trips from_xml and to_xml" do
    parsed = Seed::Types::Redirect.from_xml("<Redirect method=\"method\">text</Redirect>")

    assert_equal %w[text method], [parsed.url, parsed.method_]
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal serialized, Seed::Types::Redirect.from_xml(serialized).to_xml(xml_declaration: false)
    assert parsed.to_xml.start_with?("<?xml version=\"1.0\"")
  end

  it "returns the XML document from to_s" do
    parsed = Seed::Types::Redirect.from_xml("<Redirect method=\"method\">text</Redirect>")

    assert_equal parsed.to_xml, parsed.to_s
  end

  it "preserves unknown attributes and children" do
    parsed = Seed::Types::Redirect.from_xml("<Redirect method=\"method\" dataUnknown=\"1\">text<Unknown a=\"1\">v</Unknown></Redirect>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal "1", parsed.additional_attributes["dataUnknown"]
    assert_includes serialized, "<Unknown a=\"1\">v</Unknown>"
    assert_equal serialized, Seed::Types::Redirect.from_xml(serialized).to_xml(xml_declaration: false)
  end

  it "escapes special characters" do
    model = Seed::Types::Redirect.new(url: "a & b < c > d \"q\" 'r'", method_: "method")
    serialized = model.to_xml(xml_declaration: false)

    refute_includes serialized, "a & b"
    refute_includes serialized, "< c"
    assert_equal "a & b < c > d \"q\" 'r'", Seed::Types::Redirect.from_xml(serialized).url
  end

  it "rejects a wrong root element" do
    assert_raises(ArgumentError) { Seed::Types::Redirect.from_xml("<NotTheRedirect/>") }
  end

  it "rejects malformed XML" do
    assert_raises(ArgumentError) { Seed::Types::Redirect.from_xml("<Redirect><unclosed>") }
  end

  it "rejects a DOCTYPE declaration" do
    assert_raises(ArgumentError) { Seed::Types::Redirect.from_xml("<!DOCTYPE Redirect [<!ENTITY xxe \"injected\">]><Redirect>&xxe;</Redirect>") }
  end
end
