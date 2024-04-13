# frozen_string_literal: true

require_relative "variable_type"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class MapType
      # @return [SeedTraceClient::Commons::VariableType]
      attr_reader :key_type
      # @return [SeedTraceClient::Commons::VariableType]
      attr_reader :value_type
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param key_type [SeedTraceClient::Commons::VariableType]
      # @param value_type [SeedTraceClient::Commons::VariableType]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::MapType]
      def initialize(key_type:, value_type:, additional_properties: nil)
        @key_type = key_type
        @value_type = value_type
        @additional_properties = additional_properties
        @_field_set = { "keyType": key_type, "valueType": value_type }
      end

      # Deserialize a JSON object to an instance of MapType
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::MapType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["keyType"].nil?
          key_type = nil
        else
          key_type = parsed_json["keyType"].to_json
          key_type = SeedTraceClient::Commons::VariableType.from_json(json_object: key_type)
        end
        if parsed_json["valueType"].nil?
          value_type = nil
        else
          value_type = parsed_json["valueType"].to_json
          value_type = SeedTraceClient::Commons::VariableType.from_json(json_object: value_type)
        end
        new(
          key_type: key_type,
          value_type: value_type,
          additional_properties: struct
        )
      end

      # Serialize an instance of MapType to a JSON object
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
        SeedTraceClient::Commons::VariableType.validate_raw(obj: obj.key_type)
        SeedTraceClient::Commons::VariableType.validate_raw(obj: obj.value_type)
      end
    end
  end
end
