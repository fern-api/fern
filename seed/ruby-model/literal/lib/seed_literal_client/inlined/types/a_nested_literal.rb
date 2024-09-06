# frozen_string_literal: true

require "ostruct"
require "json"

module SeedLiteralClient
  class Inlined
    class ANestedLiteral
      # @return [String]
      attr_reader :my_literal
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param my_literal [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedLiteralClient::Inlined::ANestedLiteral]
      def initialize(my_literal:, additional_properties: nil)
        @my_literal = my_literal
        @additional_properties = additional_properties
        @_field_set = { "myLiteral": my_literal }
      end

      # Deserialize a JSON object to an instance of ANestedLiteral
      #
      # @param json_object [String]
      # @return [SeedLiteralClient::Inlined::ANestedLiteral]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        my_literal = parsed_json["myLiteral"]
        new(my_literal: my_literal, additional_properties: struct)
      end

      # Serialize an instance of ANestedLiteral to a JSON object
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
        obj.my_literal.is_a?(String) != false || raise("Passed value for field obj.my_literal is not the expected type, validation failed.")
      end
    end
  end
end
