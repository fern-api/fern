# frozen_string_literal: true

module Seed
  module Types
    # Adding a Pause in <Say>
    class Break < Internal::Types::Model
      # Set a pause based on strength
      field :strength, -> { Seed::Types::BreakStrength }, optional: true, nullable: false

      # Set a pause to a specific length of time in seconds or milliseconds
      field :time, -> { String }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "break"
      xml_attribute :strength, "strength", -> { Seed::Types::BreakStrength }
      xml_attribute :time, "time", String
    end
  end
end
