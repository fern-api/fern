# frozen_string_literal: true

require_relative "a_nested_literal"
require "ostruct"
require "json"

module SeedLiteralClient
  class Inlined
    class ATopLevelLiteral
      # @return [SeedLiteralClient::Inlined::ANestedLiteral]
      attr_reader :nested_literal
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param nested_literal [SeedLiteralClient::Inlined::ANestedLiteral]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedLiteralClient::Inlined::ATopLevelLiteral]
      def initialize(nested_literal:, additional_properties: nil)
        @nested_literal = nested_literal
        @additional_properties = additional_properties
        @_field_set = { "nestedLiteral": nested_literal }
      end

      # Deserialize a JSON object to an instance of ATopLevelLiteral
      #
      # @param json_object [String]
      # @return [SeedLiteralClient::Inlined::ATopLevelLiteral]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["nestedLiteral"].nil?
          nested_literal = nil
        else
          nested_literal = parsed_json["nestedLiteral"].to_json
          nested_literal = SeedLiteralClient::Inlined::ANestedLiteral.from_json(json_object: nested_literal)
        end
        new(nested_literal: nested_literal, additional_properties: struct)
      end

      # Serialize an instance of ATopLevelLiteral to a JSON object
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
        SeedLiteralClient::Inlined::ANestedLiteral.validate_raw(obj: obj.nested_literal)
      end
    end
  end
end
