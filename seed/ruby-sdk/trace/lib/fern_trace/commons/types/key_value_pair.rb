# frozen_string_literal: true

require_relative "variable_value"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class KeyValuePair
      attr_reader :key, :value, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param key [SeedTraceClient::Commons::VariableValue]
      # @param value [SeedTraceClient::Commons::VariableValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::KeyValuePair]
      def initialize(key:, value:, additional_properties: nil)
        # @type [SeedTraceClient::Commons::VariableValue]
        @key = key
        # @type [SeedTraceClient::Commons::VariableValue]
        @value = value
        @_field_set = { "key": @key, "value": @value }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of KeyValuePair
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::KeyValuePair]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["key"].nil?
          key = nil
        else
          key = parsed_json["key"].to_json
          key = SeedTraceClient::Commons::VariableValue.from_json(json_object: key)
        end
        if parsed_json["value"].nil?
          value = nil
        else
          value = parsed_json["value"].to_json
          value = SeedTraceClient::Commons::VariableValue.from_json(json_object: value)
        end
        new(key: key, value: value, additional_properties: struct)
      end

      # Serialize an instance of KeyValuePair to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        SeedTraceClient::Commons::VariableValue.validate_raw(obj: obj.key)
        SeedTraceClient::Commons::VariableValue.validate_raw(obj: obj.value)
      end
    end
  end
end
