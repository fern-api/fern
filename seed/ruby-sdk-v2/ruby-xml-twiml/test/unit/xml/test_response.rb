# frozen_string_literal: true

require "test_helper"

describe Seed::Types::Response do
  it "round-trips from_xml and to_xml" do
    parsed = Seed::Types::Response.from_xml("<Response><Say/></Response>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal serialized, Seed::Types::Response.from_xml(serialized).to_xml(xml_declaration: false)
    assert parsed.to_xml.start_with?("<?xml version=\"1.0\"")
  end

  it "returns the XML document from to_s" do
    parsed = Seed::Types::Response.from_xml("<Response/>")

    assert_equal parsed.to_xml, parsed.to_s
  end

  it "preserves unknown attributes and children" do
    parsed = Seed::Types::Response.from_xml("<Response dataUnknown=\"1\"><Unknown a=\"1\">v</Unknown></Response>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal "1", parsed.additional_attributes["dataUnknown"]
    assert_includes serialized, "<Unknown a=\"1\">v</Unknown>"
    assert_equal serialized, Seed::Types::Response.from_xml(serialized).to_xml(xml_declaration: false)
  end

  it "preserves child order" do
    parsed = Seed::Types::Response.from_xml("<Response><Say/><Pause/><Say/></Response>")

    assert_includes parsed.to_xml(xml_declaration: false), "<Say/><Pause/><Say/>"
  end

  it "rejects a wrong root element" do
    assert_raises(ArgumentError) { Seed::Types::Response.from_xml("<NotTheResponse/>") }
  end

  it "rejects malformed XML" do
    assert_raises(ArgumentError) { Seed::Types::Response.from_xml("<Response><unclosed>") }
  end

  it "rejects a DOCTYPE declaration" do
    assert_raises(ArgumentError) { Seed::Types::Response.from_xml("<!DOCTYPE Response [<!ENTITY xxe \"injected\">]><Response>&xxe;</Response>") }
  end
end
