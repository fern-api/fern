# frozen_string_literal: true

require "ostruct"
require "json"

module SeedServerSentEventsClient
  class Completions
    class ErrorEvent
      # @return [String]
      attr_reader :error
      # @return [Integer]
      attr_reader :code
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param error [String]
      # @param code [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedServerSentEventsClient::Completions::ErrorEvent]
      def initialize(error:, code: OMIT, additional_properties: nil)
        @error = error
        @code = code if code != OMIT
        @additional_properties = additional_properties
        @_field_set = { "error": error, "code": code }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of ErrorEvent
      #
      # @param json_object [String]
      # @return [SeedServerSentEventsClient::Completions::ErrorEvent]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        error = parsed_json["error"]
        code = parsed_json["code"]
        new(
          error: error,
          code: code,
          additional_properties: struct
        )
      end

      # Serialize an instance of ErrorEvent to a JSON object
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
        obj.error.is_a?(String) != false || raise("Passed value for field obj.error is not the expected type, validation failed.")
        obj.code&.is_a?(Integer) != false || raise("Passed value for field obj.code is not the expected type, validation failed.")
      end
    end
  end
end
