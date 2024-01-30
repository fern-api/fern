# frozen_string_literal: true

require "json"

module SeedExhaustiveClient
  module Types
    module Union
      class Cat
        attr_reader :name, :likes_to_meow, :additional_properties

        # @param name [String]
        # @param likes_to_meow [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Union::Cat]
        def initialize(name:, likes_to_meow:, additional_properties: nil)
          # @type [String]
          @name = name
          # @type [Boolean]
          @likes_to_meow = likes_to_meow
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Cat
        #
        # @param json_object [JSON]
        # @return [Types::Union::Cat]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          name = struct.name
          likes_to_meow = struct.likesToMeow
          new(name: name, likes_to_meow: likes_to_meow, additional_properties: struct)
        end

        # Serialize an instance of Cat to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "name": @name, "likesToMeow": @likes_to_meow }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
          obj.likes_to_meow.is_a?(Boolean) != false || raise("Passed value for field obj.likes_to_meow is not the expected type, validation failed.")
        end
      end
    end
  end
end
