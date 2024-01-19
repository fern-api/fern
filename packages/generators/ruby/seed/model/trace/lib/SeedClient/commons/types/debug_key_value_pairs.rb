# frozen_string_literal: true
require "commons/types/DebugVariableValue"
require "commons/types/DebugVariableValue"
require "json"

module SeedClient
  module Commons
    class DebugKeyValuePairs
      attr_reader :key, :value, :additional_properties
      # @param key [Commons::DebugVariableValue] 
      # @param value [Commons::DebugVariableValue] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::DebugKeyValuePairs] 
      def initialze(key:, value:, additional_properties: nil)
        # @type [Commons::DebugVariableValue] 
        @key = key
        # @type [Commons::DebugVariableValue] 
        @value = value
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of DebugKeyValuePairs
      #
      # @param json_object [JSON] 
      # @return [Commons::DebugKeyValuePairs] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        key = Commons::DebugVariableValue.from_json(json_object: struct.key)
        value = Commons::DebugVariableValue.from_json(json_object: struct.value)
        new(key: key, value: value, additional_properties: struct)
      end
      # Serialize an instance of DebugKeyValuePairs to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 key: @key,
 value: @value
}.to_json()
      end
    end
  end
end