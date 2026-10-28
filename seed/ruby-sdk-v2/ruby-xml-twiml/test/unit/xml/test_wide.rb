# frozen_string_literal: true

require "test_helper"

describe Seed::Types::Wide do
  it "round-trips from_xml and to_xml" do
    parsed = Seed::Types::Wide.from_xml("<Wide><Pause/></Wide>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal serialized, Seed::Types::Wide.from_xml(serialized).to_xml(xml_declaration: false)
    assert parsed.to_xml.start_with?("<?xml version=\"1.0\"")
  end

  it "returns the XML document from to_s" do
    parsed = Seed::Types::Wide.from_xml("<Wide/>")

    assert_equal parsed.to_xml, parsed.to_s
  end

  it "preserves unknown attributes and children" do
    parsed = Seed::Types::Wide.from_xml("<Wide dataUnknown=\"1\"><Unknown a=\"1\">v</Unknown></Wide>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal "1", parsed.additional_attributes["dataUnknown"]
    assert_includes serialized, "<Unknown a=\"1\">v</Unknown>"
    assert_equal serialized, Seed::Types::Wide.from_xml(serialized).to_xml(xml_declaration: false)
  end

  it "rejects a wrong root element" do
    assert_raises(ArgumentError) { Seed::Types::Wide.from_xml("<NotTheWide/>") }
  end

  it "rejects malformed XML" do
    assert_raises(ArgumentError) { Seed::Types::Wide.from_xml("<Wide><unclosed>") }
  end

  it "rejects a DOCTYPE declaration" do
    assert_raises(ArgumentError) { Seed::Types::Wide.from_xml("<!DOCTYPE Wide [<!ENTITY xxe \"injected\">]><Wide>&xxe;</Wide>") }
  end
end
