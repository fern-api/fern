# frozen_string_literal: true

require_relative "debug_variable_value"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class DebugKeyValuePairs
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      attr_reader :key
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      attr_reader :value
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param key [SeedTraceClient::Commons::DebugVariableValue]
      # @param value [SeedTraceClient::Commons::DebugVariableValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::DebugKeyValuePairs]
      def initialize(key:, value:, additional_properties: nil)
        @key = key
        @value = value
        @additional_properties = additional_properties
        @_field_set = { "key": key, "value": value }
      end

      # Deserialize a JSON object to an instance of DebugKeyValuePairs
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::DebugKeyValuePairs]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["key"].nil?
          key = nil
        else
          key = parsed_json["key"].to_json
          key = SeedTraceClient::Commons::DebugVariableValue.from_json(json_object: key)
        end
        if parsed_json["value"].nil?
          value = nil
        else
          value = parsed_json["value"].to_json
          value = SeedTraceClient::Commons::DebugVariableValue.from_json(json_object: value)
        end
        new(
          key: key,
          value: value,
          additional_properties: struct
        )
      end

      # Serialize an instance of DebugKeyValuePairs to a JSON object
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
        SeedTraceClient::Commons::DebugVariableValue.validate_raw(obj: obj.key)
        SeedTraceClient::Commons::DebugVariableValue.validate_raw(obj: obj.value)
      end
    end
  end
end
