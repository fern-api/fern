# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Object_
      class ObjectWithMapOfMap
        # @return [Hash{String => Hash}]
        attr_reader :map
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param map [Hash{String => Hash}]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithMapOfMap]
        def initialize(map:, additional_properties: nil)
          @map = map
          @additional_properties = additional_properties
          @_field_set = { "map": map }
        end

        # Deserialize a JSON object to an instance of ObjectWithMapOfMap
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithMapOfMap]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          map = parsed_json["map"]
          new(map: map, additional_properties: struct)
        end

        # Serialize an instance of ObjectWithMapOfMap to a JSON object
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
          obj.map.is_a?(Hash) != false || raise("Passed value for field obj.map is not the expected type, validation failed.")
        end
      end
    end
  end
end
