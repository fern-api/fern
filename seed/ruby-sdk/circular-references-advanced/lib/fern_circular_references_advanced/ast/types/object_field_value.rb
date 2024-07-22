# frozen_string_literal: true

require_relative "field_value"
require "ostruct"
require "json"

module SeedApiClient
  class Ast
    # This type allows us to test a circular reference with a union type (see
    #  FieldValue).
    class ObjectFieldValue
      # @return [String]
      attr_reader :name
      # @return [SeedApiClient::Ast::FieldValue]
      attr_reader :value
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param value [SeedApiClient::Ast::FieldValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedApiClient::Ast::ObjectFieldValue]
      def initialize(name:, value:, additional_properties: nil)
        @name = name
        @value = value
        @additional_properties = additional_properties
        @_field_set = { "name": name, "value": value }
      end

      # Deserialize a JSON object to an instance of ObjectFieldValue
      #
      # @param json_object [String]
      # @return [SeedApiClient::Ast::ObjectFieldValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        if parsed_json["value"].nil?
          value = nil
        else
          value = parsed_json["value"].to_json
          value = SeedApiClient::Ast::FieldValue.from_json(json_object: value)
        end
        new(
          name: name,
          value: value,
          additional_properties: struct
        )
      end

      # Serialize an instance of ObjectFieldValue to a JSON object
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
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        SeedApiClient::Ast::FieldValue.validate_raw(obj: obj.value)
      end
    end
  end
end
