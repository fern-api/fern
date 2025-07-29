# frozen_string_literal: true

require "ostruct"
require "json"

module SeedLiteralClient
  class Reference
    class NestedObjectWithLiterals
      # @return [String]
      attr_reader :literal_1
      # @return [String]
      attr_reader :literal_2
      # @return [String]
      attr_reader :str_prop
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param literal_1 [String]
      # @param literal_2 [String]
      # @param str_prop [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedLiteralClient::Reference::NestedObjectWithLiterals]
      def initialize(literal_1:, literal_2:, str_prop:, additional_properties: nil)
        @literal_1 = literal_1
        @literal_2 = literal_2
        @str_prop = str_prop
        @additional_properties = additional_properties
        @_field_set = { "literal1": literal_1, "literal2": literal_2, "strProp": str_prop }
      end

      # Deserialize a JSON object to an instance of NestedObjectWithLiterals
      #
      # @param json_object [String]
      # @return [SeedLiteralClient::Reference::NestedObjectWithLiterals]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        literal_1 = parsed_json["literal1"]
        literal_2 = parsed_json["literal2"]
        str_prop = parsed_json["strProp"]
        new(
          literal_1: literal_1,
          literal_2: literal_2,
          str_prop: str_prop,
          additional_properties: struct
        )
      end

      # Serialize an instance of NestedObjectWithLiterals to a JSON object
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
        obj.literal_1.is_a?(String) != false || raise("Passed value for field obj.literal_1 is not the expected type, validation failed.")
        obj.literal_2.is_a?(String) != false || raise("Passed value for field obj.literal_2 is not the expected type, validation failed.")
        obj.str_prop.is_a?(String) != false || raise("Passed value for field obj.str_prop is not the expected type, validation failed.")
      end
    end
  end
end
