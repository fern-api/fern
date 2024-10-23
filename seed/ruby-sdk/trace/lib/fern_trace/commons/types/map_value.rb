# frozen_string_literal: true

require_relative "key_value_pair"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class MapValue
      # @return [Array<SeedTraceClient::Commons::KeyValuePair>]
      attr_reader :key_value_pairs
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param key_value_pairs [Array<SeedTraceClient::Commons::KeyValuePair>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::MapValue]
      def initialize(key_value_pairs:, additional_properties: nil)
        @key_value_pairs = key_value_pairs
        @additional_properties = additional_properties
        @_field_set = { "keyValuePairs": key_value_pairs }
      end

      # Deserialize a JSON object to an instance of MapValue
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::MapValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        key_value_pairs = parsed_json["keyValuePairs"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Commons::KeyValuePair.from_json(json_object: item)
        end
        new(key_value_pairs: key_value_pairs, additional_properties: struct)
      end

      # Serialize an instance of MapValue to a JSON object
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
        obj.key_value_pairs.is_a?(Array) != false || raise("Passed value for field obj.key_value_pairs is not the expected type, validation failed.")
      end
    end
  end
end
