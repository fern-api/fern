# frozen_string_literal: true

module Seed
  module Types
    # <Say> TwiML Verb
    class Say < Internal::Types::Model
      # Message to say
      field :message, -> { String }, optional: true, nullable: false

      # Voice to use
      field :voice, -> { String }, optional: true, nullable: false

      # Times to loop message
      field :loop, -> { Integer }, optional: true, nullable: false

      # Nested TwiML elements, rendered in order.
      field :children, -> { Internal::Types::Array[Seed::Types::Break] }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Say"
      xml_text :message, String
      xml_attribute :voice, "voice", String
      xml_attribute :loop, "loop", Integer
      xml_child :children, -> { Seed::Types::Break }, list: true

      # Appends a <break> child element and returns it. Pass an existing Break to append it as-is.
      #
      # Adding a Pause in <Say>
      #
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @option attributes [Seed::Types::BreakStrength, nil] :strength Set a pause based on strength
      # @option attributes [String, nil] :time Set a pause to a specific length of time in seconds or milliseconds
      # @return [Break]
      def break_(**attributes)
        child = Seed::Types::Break.new(**attributes)
        self.children = [*children, child]
        record_content(child)
        child
      end
    end
  end
end
