# frozen_string_literal: true

module Seed
  module Types
    # Root TwiML element.
    class Response < Internal::Types::Model
      field :children, -> { Internal::Types::Array[Seed::Types::ResponseChildrenItem] }, optional: true, nullable: false

      include Seed::Internal::Xml::Serializable

      xml_element "Response", root: true
      xml_child :children, -> { [Seed::Types::Say, Seed::Types::Dial, Seed::Types::Pause, Seed::Types::Hangup, Seed::Types::Redirect] }, list: true

      # Appends a <Say> child element and returns it. Pass an existing Say to append it as-is.
      #
      # <Say> TwiML Verb
      #
      # @param message [String, Say, nil] the text content (Message to say)
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @option attributes [String, nil] :voice Voice to use
      # @option attributes [Integer, nil] :loop Times to loop message
      # @option attributes [Array[Seed::Types::Break], nil] :children Nested TwiML elements, rendered in order.
      # @return [Say]
      def say(message = nil, **attributes)
        child = message.is_a?(Seed::Types::Say) ? message : Seed::Types::Say.new(**attributes, message: message)
        self.children = [*children, child]
        child
      end

      # Appends a <Dial> child element and returns it. Pass an existing Dial to append it as-is.
      #
      # @param number [String, Dial, nil] the text content
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @option attributes [Array[String], nil] :status_callback_event
      # @option attributes [Array[Seed::Types::DialRecordItem], nil] :record
      # @option attributes [Array[Seed::Types::Number], nil] :numbers
      # @return [Dial]
      def dial(number = nil, **attributes)
        child = number.is_a?(Seed::Types::Dial) ? number : Seed::Types::Dial.new(**attributes, number: number)
        self.children = [*children, child]
        child
      end

      # Appends a <Pause> child element and returns it. Pass an existing Pause to append it as-is.
      #
      # XML element without an explicit xml.name; falls back to the schema name.
      #
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @option attributes [Integer, nil] :length
      # @return [Pause]
      def pause(**attributes)
        child = Seed::Types::Pause.new(**attributes)
        self.children = [*children, child]
        child
      end

      # Appends a <Hangup> child element and returns it. Pass an existing Hangup to append it as-is.
      #
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @return [Hangup]
      def hangup(**attributes)
        child = Seed::Types::Hangup.new(**attributes)
        self.children = [*children, child]
        child
      end

      # Appends a <Redirect> child element and returns it. Pass an existing Redirect to append it as-is.
      #
      # Text element with a required attribute.
      #
      # @param url [String, Redirect, nil] the text content
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @option attributes [String] :method_
      # @option attributes [String, nil] :kind
      # @return [Redirect]
      def redirect(url = nil, **attributes)
        child = url.is_a?(Seed::Types::Redirect) ? url : Seed::Types::Redirect.new(**attributes, url: url)
        self.children = [*children, child]
        child
      end
    end
  end
end
