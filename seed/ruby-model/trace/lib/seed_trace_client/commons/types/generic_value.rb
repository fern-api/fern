# frozen_string_literal: true

require "json"

module SeedTraceClient
  module Commons
    class GenericValue
      attr_reader :stringified_type, :stringified_value, :additional_properties

      # @param stringified_type [String]
      # @param stringified_value [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::GenericValue]
      def initialize(stringified_value:, stringified_type: nil, additional_properties: nil)
        # @type [String]
        @stringified_type = stringified_type
        # @type [String]
        @stringified_value = stringified_value
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GenericValue
      #
      # @param json_object [JSON]
      # @return [Commons::GenericValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        stringified_type = struct.stringifiedType
        stringified_value = struct.stringifiedValue
        new(stringified_type: stringified_type, stringified_value: stringified_value, additional_properties: struct)
      end

      # Serialize an instance of GenericValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "stringifiedType": @stringified_type, "stringifiedValue": @stringified_value }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.stringified_type&.is_a?(String) != false || raise("Passed value for field obj.stringified_type is not the expected type, validation failed.")
        obj.stringified_value.is_a?(String) != false || raise("Passed value for field obj.stringified_value is not the expected type, validation failed.")
      end
    end
  end
end
