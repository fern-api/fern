# frozen_string_literal: true

require "ostruct"
require "json"

module SeedServerSentEventsClient
  class Completions
    class CompletionEvent
      # @return [String]
      attr_reader :content
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param content [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedServerSentEventsClient::Completions::CompletionEvent]
      def initialize(content:, additional_properties: nil)
        @content = content
        @additional_properties = additional_properties
        @_field_set = { "content": content }
      end

      # Deserialize a JSON object to an instance of CompletionEvent
      #
      # @param json_object [String]
      # @return [SeedServerSentEventsClient::Completions::CompletionEvent]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        content = parsed_json["content"]
        new(content: content, additional_properties: struct)
      end

      # Serialize an instance of CompletionEvent to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.content.is_a?(String) != false || raise("Passed value for field obj.content is not the expected type, validation failed.")
      end
    end
  end
end
