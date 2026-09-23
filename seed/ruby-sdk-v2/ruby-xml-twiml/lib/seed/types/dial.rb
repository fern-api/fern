# frozen_string_literal: true

module Seed
  module Types
    class Dial < Internal::Types::Model
      field :number, -> { String }, optional: true, nullable: false

      field :status_callback_event, -> { Internal::Types::Array[String] }, optional: true, nullable: false

      field :record, -> { Internal::Types::Array[Seed::Types::DialRecordItem] }, optional: true, nullable: false

      field :numbers, -> { Internal::Types::Array[Seed::Types::Number] }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Dial", namespace: "https://www.twilio.com/twiml", prefix: "tw"
      xml_text :number, String
      xml_attribute :status_callback_event, "statusCallbackEvent", String, list: true
      xml_attribute :record, "record", -> { Seed::Types::DialRecordItem }, list: true
      xml_child :numbers, -> { Seed::Types::Number }, name: "Numbers", list: true, wrapped: true

      # Appends a <Number> child element and returns it. Pass an existing Number to append it as-is.
      #
      # @param phone_number [String, Number, nil] the text content
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @return [Number]
      def add_number(phone_number = nil, **attributes)
        child = phone_number.is_a?(Seed::Types::Number) ? phone_number : Seed::Types::Number.new(**attributes, phone_number: phone_number)
        self.numbers = [*numbers, child]
        child
      end
    end
  end
end
