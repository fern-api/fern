# frozen_string_literal: true

require_relative "field_name"
require_relative "field_value"
require "json"

module SeedApiClient
  class Ast
    class ObjectFieldValue
      attr_reader :name, :value, :additional_properties

      # @param name [Ast::FIELD_NAME]
      # @param value [Ast::FieldValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Ast::ObjectFieldValue]
      def initialize(name:, value:, additional_properties: nil)
        # @type [Ast::FIELD_NAME]
        @name = name
        # @type [Ast::FieldValue]
        @value = value
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ObjectFieldValue
      #
      # @param json_object [JSON]
      # @return [Ast::ObjectFieldValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = struct.name
        if parsed_json["value"].nil?
          value = nil
        else
          value = parsed_json["value"].to_json
          value = Ast::FieldValue.from_json(json_object: value)
        end
        new(name: name, value: value, additional_properties: struct)
      end

      # Serialize an instance of ObjectFieldValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "value": @value }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        Ast::FieldValue.validate_raw(obj: obj.value)
      end
    end
  end
end
