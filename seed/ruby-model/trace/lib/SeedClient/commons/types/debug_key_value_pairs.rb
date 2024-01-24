# frozen_string_literal: true

require_relative "debug_variable_value"
require "json"

module SeedClient
  module Commons
    class DebugKeyValuePairs
      attr_reader :key, :value, :additional_properties

      # @param key [Commons::DebugVariableValue]
      # @param value [Commons::DebugVariableValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::DebugKeyValuePairs]
      def initialize(key:, value:, additional_properties: nil)
        # @type [Commons::DebugVariableValue]
        @key = key
        # @type [Commons::DebugVariableValue]
        @value = value
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of DebugKeyValuePairs
      #
      # @param json_object [JSON]
      # @return [Commons::DebugKeyValuePairs]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        key = struct.key.to_h.to_json
        key = Commons::DebugVariableValue.from_json(json_object: key)
        value = struct.value.to_h.to_json
        value = Commons::DebugVariableValue.from_json(json_object: value)
        new(key: key, value: value, additional_properties: struct)
      end

      # Serialize an instance of DebugKeyValuePairs to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "key": @key, "value": @value }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Commons::DebugVariableValue.validate_raw(obj: obj.key)
        Commons::DebugVariableValue.validate_raw(obj: obj.value)
      end
    end
  end
end
