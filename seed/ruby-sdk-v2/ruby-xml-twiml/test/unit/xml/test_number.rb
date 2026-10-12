# frozen_string_literal: true

require "test_helper"

describe Seed::Types::Number do
  it "round-trips from_xml and to_xml" do
    parsed = Seed::Types::Number.from_xml("<Number/>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal serialized, Seed::Types::Number.from_xml(serialized).to_xml(xml_declaration: false)
    assert parsed.to_xml.start_with?("<?xml version=\"1.0\"")
  end

  it "returns the XML document from to_s" do
    parsed = Seed::Types::Number.from_xml("<Number/>")

    assert_equal parsed.to_xml, parsed.to_s
  end

  it "preserves unknown attributes and children" do
    parsed = Seed::Types::Number.from_xml("<Number dataUnknown=\"1\"><Unknown a=\"1\">v</Unknown></Number>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal "1", parsed.additional_attributes["dataUnknown"]
    assert_includes serialized, "<Unknown a=\"1\">v</Unknown>"
    assert_equal serialized, Seed::Types::Number.from_xml(serialized).to_xml(xml_declaration: false)
  end

  it "rejects a wrong root element" do
    assert_raises(ArgumentError) { Seed::Types::Number.from_xml("<NotTheNumber/>") }
  end

  it "rejects malformed XML" do
    assert_raises(ArgumentError) { Seed::Types::Number.from_xml("<Number><unclosed>") }
  end

  it "rejects a DOCTYPE declaration" do
    assert_raises(ArgumentError) { Seed::Types::Number.from_xml("<!DOCTYPE Number [<!ENTITY xxe \"injected\">]><Number>&xxe;</Number>") }
  end
end
