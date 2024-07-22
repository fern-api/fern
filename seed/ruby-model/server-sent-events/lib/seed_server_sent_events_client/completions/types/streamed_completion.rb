# frozen_string_literal: true

require "ostruct"
require "json"

module SeedServerSentEventsClient
  class Completions
    class StreamedCompletion
      # @return [String]
      attr_reader :delta
      # @return [Integer]
      attr_reader :tokens
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param delta [String]
      # @param tokens [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedServerSentEventsClient::Completions::StreamedCompletion]
      def initialize(delta:, tokens: OMIT, additional_properties: nil)
        @delta = delta
        @tokens = tokens if tokens != OMIT
        @additional_properties = additional_properties
        @_field_set = { "delta": delta, "tokens": tokens }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of StreamedCompletion
      #
      # @param json_object [String]
      # @return [SeedServerSentEventsClient::Completions::StreamedCompletion]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        delta = parsed_json["delta"]
        tokens = parsed_json["tokens"]
        new(
          delta: delta,
          tokens: tokens,
          additional_properties: struct
        )
      end

      # Serialize an instance of StreamedCompletion to a JSON object
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
        obj.delta.is_a?(String) != false || raise("Passed value for field obj.delta is not the expected type, validation failed.")
        obj.tokens&.is_a?(Integer) != false || raise("Passed value for field obj.tokens is not the expected type, validation failed.")
      end
    end
  end
end
