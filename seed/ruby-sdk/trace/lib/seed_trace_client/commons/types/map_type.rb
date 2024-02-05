# frozen_string_literal: true

require_relative "variable_type"
require "json"

module SeedTraceClient
  module Commons
    class MapType
      attr_reader :key_type, :value_type, :additional_properties

      # @param key_type [Commons::VariableType]
      # @param value_type [Commons::VariableType]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::MapType]
      def initialize(key_type:, value_type:, additional_properties: nil)
        # @type [Commons::VariableType]
        @key_type = key_type
        # @type [Commons::VariableType]
        @value_type = value_type
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of MapType
      #
      # @param json_object [JSON]
      # @return [Commons::MapType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        key_type = struct.keyType.to_h.to_json
        key_type = Commons::VariableType.from_json(json_object: key_type)
        value_type = struct.valueType.to_h.to_json
        value_type = Commons::VariableType.from_json(json_object: value_type)
        new(key_type: key_type, value_type: value_type, additional_properties: struct)
      end

      # Serialize an instance of MapType to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "keyType": @key_type, "valueType": @value_type }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Commons::VariableType.validate_raw(obj: obj.key_type)
        Commons::VariableType.validate_raw(obj: obj.value_type)
      end
    end
  end
end
