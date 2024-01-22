# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class ExpressionLocation
      attr_reader :start, :offset, :additional_properties

      # @param start [Integer]
      # @param offset [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ExpressionLocation]
      def initialze(start:, offset:, additional_properties: nil)
        # @type [Integer]
        @start = start
        # @type [Integer]
        @offset = offset
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ExpressionLocation
      #
      # @param json_object [JSON]
      # @return [Submission::ExpressionLocation]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        start struct.start
        offset struct.offset
        new(start: start, offset: offset, additional_properties: struct)
      end

      # Serialize an instance of ExpressionLocation to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { start: @start, offset: @offset }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
