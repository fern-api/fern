# frozen_string_literal: true

require_relative "object_with_optional_field"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    module Object_
      module Types
        class NestedObjectWithOptionalField
          # @return [String]
          attr_reader :string
          # @return [SeedExhaustiveClient::Types::Object_::Types::ObjectWithOptionalField]
          attr_reader :nested_object
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param string [String]
          # @param nested_object [SeedExhaustiveClient::Types::Object_::Types::ObjectWithOptionalField]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedExhaustiveClient::Types::Object_::Types::NestedObjectWithOptionalField]
          def initialize(string: OMIT, nested_object: OMIT, additional_properties: nil)
            @string = string if string != OMIT
            @nested_object = nested_object if nested_object != OMIT
            @additional_properties = additional_properties
            @_field_set = { "string": string, "NestedObject": nested_object }.reject do |_k, v|
              v == OMIT
            end
          end

          # Deserialize a JSON object to an instance of NestedObjectWithOptionalField
          #
          # @param json_object [String]
          # @return [SeedExhaustiveClient::Types::Object_::Types::NestedObjectWithOptionalField]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            string = parsed_json["string"]
            if parsed_json["NestedObject"].nil?
              nested_object = nil
            else
              nested_object = parsed_json["NestedObject"].to_json
              nested_object = SeedExhaustiveClient::Types::Object_::Types::ObjectWithOptionalField.from_json(json_object: nested_object)
            end
            new(
              string: string,
              nested_object: nested_object,
              additional_properties: struct
            )
          end

          # Serialize an instance of NestedObjectWithOptionalField to a JSON object
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
            obj.string&.is_a?(String) != false || raise("Passed value for field obj.string is not the expected type, validation failed.")
            obj.nested_object.nil? || SeedExhaustiveClient::Types::Object_::Types::ObjectWithOptionalField.validate_raw(obj: obj.nested_object)
          end
        end
      end
    end
  end
end
