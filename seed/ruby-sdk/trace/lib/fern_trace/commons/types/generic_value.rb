# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class GenericValue
      # @return [String]
      attr_reader :stringified_type
      # @return [String]
      attr_reader :stringified_value
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param stringified_type [String]
      # @param stringified_value [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::GenericValue]
      def initialize(stringified_value:, stringified_type: OMIT, additional_properties: nil)
        @stringified_type = stringified_type if stringified_type != OMIT
        @stringified_value = stringified_value
        @additional_properties = additional_properties
        @_field_set = { "stringifiedType": stringified_type, "stringifiedValue": stringified_value }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of GenericValue
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::GenericValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        stringified_type = parsed_json["stringifiedType"]
        stringified_value = parsed_json["stringifiedValue"]
        new(
          stringified_type: stringified_type,
          stringified_value: stringified_value,
          additional_properties: struct
        )
      end

      # Serialize an instance of GenericValue to a JSON object
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
        obj.stringified_type&.is_a?(String) != false || raise("Passed value for field obj.stringified_type is not the expected type, validation failed.")
        obj.stringified_value.is_a?(String) != false || raise("Passed value for field obj.stringified_value is not the expected type, validation failed.")
      end
    end
  end
end
