# frozen_string_literal: true

require_relative "object_with_optional_field"
require "json"

module SeedExhaustiveClient
  module Types
    class Object
      class NestedObjectWithRequiredField
        attr_reader :string, :nested_object, :additional_properties

        # @param string [String]
        # @param nested_object [Types::Object::ObjectWithOptionalField]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Object::NestedObjectWithRequiredField]
        def initialize(string:, nested_object:, additional_properties: nil)
          # @type [String]
          @string = string
          # @type [Types::Object::ObjectWithOptionalField]
          @nested_object = nested_object
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of NestedObjectWithRequiredField
        #
        # @param json_object [JSON]
        # @return [Types::Object::NestedObjectWithRequiredField]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          string = struct.string
          if parsed_json["NestedObject"].nil?
            nested_object = nil
          else
            nested_object = parsed_json["NestedObject"].to_json
            nested_object = Types::Object::ObjectWithOptionalField.from_json(json_object: nested_object)
          end
          new(string: string, nested_object: nested_object, additional_properties: struct)
        end

        # Serialize an instance of NestedObjectWithRequiredField to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "string": @string, "NestedObject": @nested_object }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.string.is_a?(String) != false || raise("Passed value for field obj.string is not the expected type, validation failed.")
          Types::Object::ObjectWithOptionalField.validate_raw(obj: obj.nested_object)
        end
      end
    end
  end
end
