# frozen_string_literal: true

module Seed
  module Types
    class Number < Internal::Types::Model
      field :phone_number, -> { String }, optional: true, nullable: false

      field :send_digits, -> { String }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Number"
      xml_text :phone_number, String
      xml_attribute :send_digits, "sendDigits", String
    end
  end
end
