# frozen_string_literal: true

require "json"

module SeedExhaustiveClient
  module Types
    class Union
      class Dog
        attr_reader :name, :likes_to_woof, :additional_properties

        # @param name [String]
        # @param likes_to_woof [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Union::Dog]
        def initialize(name:, likes_to_woof:, additional_properties: nil)
          # @type [String]
          @name = name
          # @type [Boolean]
          @likes_to_woof = likes_to_woof
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Dog
        #
        # @param json_object [JSON]
        # @return [Types::Union::Dog]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          JSON.parse(json_object)
          name = struct.name
          likes_to_woof = struct.likesToWoof
          new(name: name, likes_to_woof: likes_to_woof, additional_properties: struct)
        end

        # Serialize an instance of Dog to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "name": @name, "likesToWoof": @likes_to_woof }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
          obj.likes_to_woof.is_a?(Boolean) != false || raise("Passed value for field obj.likes_to_woof is not the expected type, validation failed.")
        end
      end
    end
  end
end
