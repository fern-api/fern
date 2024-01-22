# frozen_string_literal: true
require "commons/types/VariableType"
require "commons/types/VariableType"
require "json"

module SeedClient
  module Commons
    class MapType
      attr_reader :key_type, :value_type, :additional_properties
      # @param key_type [Commons::VariableType] 
      # @param value_type [Commons::VariableType] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::MapType] 
      def initialze(key_type:, value_type:, additional_properties: nil)
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
        key_type Commons::VariableType.from_json(json_object: struct.keyType)
        value_type Commons::VariableType.from_json(json_object: struct.valueType)
        new(key_type: key_type, value_type: value_type, additional_properties: struct)
      end
      # Serialize an instance of MapType to a JSON object
      #
      # @return [JSON] 
      def to_json
        { keyType: @key_type, valueType: @value_type }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        VariableType.validate_raw(obj: obj.key_type)
        VariableType.validate_raw(obj: obj.value_type)
      end
    end
  end
end