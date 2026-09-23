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
      # @param message [String, Say, nil] the text content
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
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
      # @return [Dial]
      def dial(number = nil, **attributes)
        child = number.is_a?(Seed::Types::Dial) ? number : Seed::Types::Dial.new(**attributes, number: number)
        self.children = [*children, child]
        child
      end

      # Appends a <Pause> child element and returns it. Pass an existing Pause to append it as-is.
      #
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
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
      # @param url [String, Redirect, nil] the text content
      # @param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes
      # @return [Redirect]
      def redirect(url = nil, **attributes)
        child = url.is_a?(Seed::Types::Redirect) ? url : Seed::Types::Redirect.new(**attributes, url: url)
        self.children = [*children, child]
        child
      end
    end
  end
end
