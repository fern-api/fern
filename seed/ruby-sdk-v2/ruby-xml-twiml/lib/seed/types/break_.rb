# frozen_string_literal: true

module Seed
  module Types
    class Break < Internal::Types::Model
      field :strength, -> { Seed::Types::BreakStrength }, optional: true, nullable: false

      field :time, -> { String }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "break"
      xml_attribute :strength, "strength", -> { Seed::Types::BreakStrength }
      xml_attribute :time, "time", String
    end
  end
end
