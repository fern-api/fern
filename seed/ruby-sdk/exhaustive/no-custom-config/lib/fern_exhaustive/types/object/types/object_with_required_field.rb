# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Object_
      class ObjectWithRequiredField
        # @return [String]
        attr_reader :string
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param string [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField]
        def initialize(string:, additional_properties: nil)
          @string = string
          @additional_properties = additional_properties
          @_field_set = { "string": string }
        end

        # Deserialize a JSON object to an instance of ObjectWithRequiredField
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          string = parsed_json["string"]
          new(string: string, additional_properties: struct)
        end

        # Serialize an instance of ObjectWithRequiredField to a JSON object
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
          obj.string.is_a?(String) != false || raise("Passed value for field obj.string is not the expected type, validation failed.")
        end
      end
    end
  end
end
