# frozen_string_literal: true

require_relative "nested_object_with_literals"
require "ostruct"
require "json"

module SeedLiteralClient
  class Reference
    class ContainerObject
      # @return [Array<SeedLiteralClient::Reference::NestedObjectWithLiterals>]
      attr_reader :nested_objects
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param nested_objects [Array<SeedLiteralClient::Reference::NestedObjectWithLiterals>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedLiteralClient::Reference::ContainerObject]
      def initialize(nested_objects:, additional_properties: nil)
        @nested_objects = nested_objects
        @additional_properties = additional_properties
        @_field_set = { "nestedObjects": nested_objects }
      end

      # Deserialize a JSON object to an instance of ContainerObject
      #
      # @param json_object [String]
      # @return [SeedLiteralClient::Reference::ContainerObject]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        nested_objects = parsed_json["nestedObjects"]&.map do |item|
          item = item.to_json
          SeedLiteralClient::Reference::NestedObjectWithLiterals.from_json(json_object: item)
        end
        new(nested_objects: nested_objects, additional_properties: struct)
      end

      # Serialize an instance of ContainerObject to a JSON object
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
        obj.nested_objects.is_a?(Array) != false || raise("Passed value for field obj.nested_objects is not the expected type, validation failed.")
      end
    end
  end
end
