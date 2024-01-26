# frozen_string_literal: true

require_relative "key_value_pair"
require "json"

module SeedTraceClient
  module Commons
    class MapValue
      attr_reader :key_value_pairs, :additional_properties

      # @param key_value_pairs [Array<Commons::KeyValuePair>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::MapValue]
      def initialize(key_value_pairs:, additional_properties: nil)
        # @type [Array<Commons::KeyValuePair>]
        @key_value_pairs = key_value_pairs
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of MapValue
      #
      # @param json_object [JSON]
      # @return [Commons::MapValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        key_value_pairs = struct.keyValuePairs.map do |v|
          v = v.to_h.to_json
          Commons::KeyValuePair.from_json(json_object: v)
        end
        new(key_value_pairs: key_value_pairs, additional_properties: struct)
      end

      # Serialize an instance of MapValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "keyValuePairs": @key_value_pairs }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.key_value_pairs.is_a?(Array) != false || raise("Passed value for field obj.key_value_pairs is not the expected type, validation failed.")
      end
    end
  end
end
