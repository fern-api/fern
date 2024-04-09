# frozen_string_literal: true

require_relative "object_with_optional_field"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Object
      class NestedObjectWithRequiredField
        attr_reader :string, :nested_object, :additional_properties, :_field_set
        protected :_field_set
        OMIT = Object.new
        # @param string [String]
        # @param nested_object [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField]
        def initialize(string:, nested_object:, additional_properties: nil)
          # @type [String]
          @string = string
          # @type [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
          @nested_object = nested_object
          @_field_set = { "string": @string, "NestedObject": @nested_object }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of NestedObjectWithRequiredField
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          string = struct["string"]
          if parsed_json["NestedObject"].nil?
            nested_object = nil
          else
            nested_object = parsed_json["NestedObject"].to_json
            nested_object = SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: nested_object)
          end
          new(string: string, nested_object: nested_object, additional_properties: struct)
        end

        # Serialize an instance of NestedObjectWithRequiredField to a JSON object
        #
        # @return [String]
        def to_json(*_args)
          @_field_set&.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.string.is_a?(String) != false || raise("Passed value for field obj.string is not the expected type, validation failed.")
          SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.validate_raw(obj: obj.nested_object)
        end
      end
    end
  end
end
