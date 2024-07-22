# frozen_string_literal: true

require "ostruct"
require "json"

module SeedUnknownAsAnyClient
  class Unknown
    class MyObject
      # @return [Object]
      attr_reader :unknown
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param unknown [Object]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUnknownAsAnyClient::Unknown::MyObject]
      def initialize(unknown:, additional_properties: nil)
        @unknown = unknown
        @additional_properties = additional_properties
        @_field_set = { "unknown": unknown }
      end

      # Deserialize a JSON object to an instance of MyObject
      #
      # @param json_object [String]
      # @return [SeedUnknownAsAnyClient::Unknown::MyObject]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        unknown = parsed_json["unknown"]
        new(unknown: unknown, additional_properties: struct)
      end

      # Serialize an instance of MyObject to a JSON object
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
        obj.unknown.is_a?(Object) != false || raise("Passed value for field obj.unknown is not the expected type, validation failed.")
      end
    end
  end
end
