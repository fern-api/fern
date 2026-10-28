# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Number < Internal::Types::Model
      field :phone_number, -> { String }, optional: true, nullable: false

      field :send_digits, -> { String }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Number"
      xml_text :phone_number, String
      xml_attribute :send_digits, "sendDigits", String

      # The text content of this element (same as `phone_number`).
      #
      # @return [String, nil]
      def text
        @data[:phone_number]
      end

      # Sets the text content of this element (same as `phone_number=`).
      def text=(value)
        self.phone_number = value
      end
    end
  end
end
