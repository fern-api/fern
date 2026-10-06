# frozen_string_literal: true

require "test_helper"

describe Seed::Types::Dial do
  it "round-trips from_xml and to_xml" do
    xml = <<~XML.chomp
      <tw:Dial xmlns:tw="https://www.twilio.com/twiml" statusCallbackEvent="statusCallbackEvent statusCallbackEvent-2" record="record-from-answer record-from-ringing"><Numbers><Number/></Numbers></tw:Dial>
    XML
    parsed = Seed::Types::Dial.from_xml(xml)

    assert_equal [%w[statusCallbackEvent statusCallbackEvent-2], %w[record-from-answer record-from-ringing]], [parsed.status_callback_event, parsed.record]
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal serialized, Seed::Types::Dial.from_xml(serialized).to_xml(xml_declaration: false)
    assert parsed.to_xml.start_with?("<?xml version=\"1.0\"")
  end

  it "returns the XML document from to_s" do
    parsed = Seed::Types::Dial.from_xml("<tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\"/>")

    assert_equal parsed.to_xml, parsed.to_s
  end

  it "preserves unknown attributes and children" do
    parsed = Seed::Types::Dial.from_xml("<tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\" dataUnknown=\"1\"><Unknown a=\"1\">v</Unknown></tw:Dial>")
    serialized = parsed.to_xml(xml_declaration: false)

    assert_equal "1", parsed.additional_attributes["dataUnknown"]
    assert_includes serialized, "<Unknown a=\"1\">v</Unknown>"
    assert_equal serialized, Seed::Types::Dial.from_xml(serialized).to_xml(xml_declaration: false)
  end

  it "rejects a wrong root element" do
    assert_raises(ArgumentError) { Seed::Types::Dial.from_xml("<NotThetw:Dial/>") }
  end

  it "rejects malformed XML" do
    assert_raises(ArgumentError) { Seed::Types::Dial.from_xml("<tw:Dial><unclosed>") }
  end

  it "rejects a DOCTYPE declaration" do
    assert_raises(ArgumentError) { Seed::Types::Dial.from_xml("<!DOCTYPE tw:Dial [<!ENTITY xxe \"injected\">]><tw:Dial xmlns:tw=\"https://www.twilio.com/twiml\">&xxe;</tw:Dial>") }
  end
end
