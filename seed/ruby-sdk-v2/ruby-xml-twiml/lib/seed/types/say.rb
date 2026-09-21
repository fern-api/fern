# frozen_string_literal: true

module Seed
  module Types
    class Say < Internal::Types::Model
      field :message, -> { String }, optional: true, nullable: false

      field :voice, -> { String }, optional: true, nullable: false

      field :loop, -> { Integer }, optional: true, nullable: false

      field :children, -> { Internal::Types::Array[Seed::Types::Break] }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Say"
      xml_text :message, String
      xml_attribute :voice, "voice", String
      xml_attribute :loop, "loop", Integer
      xml_child :children, -> { Seed::Types::Break }, list: true

      # Appends a <break> child element and returns it. Pass an existing Break to append it as-is.
      #
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @return [Break]
      def break_(**attributes)
        child = Seed::Types::Break.new(**attributes)
        self.children = [*children, child]
        child
      end
    end
  end
end
