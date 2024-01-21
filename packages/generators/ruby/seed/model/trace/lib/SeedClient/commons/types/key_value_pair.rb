# frozen_string_literal: true
require "commons/types/VariableValue"
require "commons/types/VariableValue"
require "json"

module SeedClient
  module Commons
    class KeyValuePair
      attr_reader :key, :value, :additional_properties
      # @param key [Commons::VariableValue] 
      # @param value [Commons::VariableValue] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::KeyValuePair] 
      def initialze(key:, value:, additional_properties: nil)
        # @type [Commons::VariableValue] 
        @key = key
        # @type [Commons::VariableValue] 
        @value = value
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of KeyValuePair
      #
      # @param json_object [JSON] 
      # @return [Commons::KeyValuePair] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        key = Commons::VariableValue.from_json(json_object: struct.key)
        value = Commons::VariableValue.from_json(json_object: struct.value)
        new(key: key, value: value, additional_properties: struct)
      end
      # Serialize an instance of KeyValuePair to a JSON object
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