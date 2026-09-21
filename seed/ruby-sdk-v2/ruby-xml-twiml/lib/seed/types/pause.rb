# frozen_string_literal: true

module Seed
  module Types
    # XML element without an explicit xml.name; falls back to the schema name.
    class Pause < Internal::Types::Model
      field :length, -> { Integer }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Pause"
      xml_attribute :length, "length", Integer
    end
  end
end
