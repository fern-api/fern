# frozen_string_literal: true

require "json"

module SeedClient
  module Types
    module Object
      class ObjectWithRequiredField
        attr_reader :string, :additional_properties

        # @param string [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Object::ObjectWithRequiredField]
        def initialze(string:, additional_properties: nil)
          # @type [String]
          @string = string
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of ObjectWithRequiredField
        #
        # @param json_object [JSON]
        # @return [Types::Object::ObjectWithRequiredField]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          string = struct.string
          new(string: string, additional_properties: struct)
        end

        # Serialize an instance of ObjectWithRequiredField to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "string": @string }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
