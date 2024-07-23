# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class ExpressionLocation
      # @return [Integer]
      attr_reader :start
      # @return [Integer]
      attr_reader :offset
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param start [Integer]
      # @param offset [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::ExpressionLocation]
      def initialize(start:, offset:, additional_properties: nil)
        @start = start
        @offset = offset
        @additional_properties = additional_properties
        @_field_set = { "start": start, "offset": offset }
      end

      # Deserialize a JSON object to an instance of ExpressionLocation
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::ExpressionLocation]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        start = parsed_json["start"]
        offset = parsed_json["offset"]
        new(
          start: start,
          offset: offset,
          additional_properties: struct
        )
      end

      # Serialize an instance of ExpressionLocation to a JSON object
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
        obj.start.is_a?(Integer) != false || raise("Passed value for field obj.start is not the expected type, validation failed.")
        obj.offset.is_a?(Integer) != false || raise("Passed value for field obj.offset is not the expected type, validation failed.")
      end
    end
  end
end
