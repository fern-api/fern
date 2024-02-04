# frozen_string_literal: true

require "json"

module SeedExhaustiveClient
  module Types
    module Object
      class ObjectWithMapOfMap
        attr_reader :map, :additional_properties

        # @param map [Hash{String => String}]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Object::ObjectWithMapOfMap]
        def initialize(map:, additional_properties: nil)
          # @type [Hash{String => String}]
          @map = map
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of ObjectWithMapOfMap
        #
        # @param json_object [JSON]
        # @return [Types::Object::ObjectWithMapOfMap]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          map = struct.map
          new(map: map, additional_properties: struct)
        end

        # Serialize an instance of ObjectWithMapOfMap to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "map": @map }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
