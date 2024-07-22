# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    module Union
      module Types
        class Dog
          # @return [String]
          attr_reader :name
          # @return [Boolean]
          attr_reader :likes_to_woof
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param name [String]
          # @param likes_to_woof [Boolean]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedExhaustiveClient::Types::Union::Types::Dog]
          def initialize(name:, likes_to_woof:, additional_properties: nil)
            @name = name
            @likes_to_woof = likes_to_woof
            @additional_properties = additional_properties
            @_field_set = { "name": name, "likesToWoof": likes_to_woof }
          end

          # Deserialize a JSON object to an instance of Dog
          #
          # @param json_object [String]
          # @return [SeedExhaustiveClient::Types::Union::Types::Dog]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            name = parsed_json["name"]
            likes_to_woof = parsed_json["likesToWoof"]
            new(
              name: name,
              likes_to_woof: likes_to_woof,
              additional_properties: struct
            )
          end

          # Serialize an instance of Dog to a JSON object
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
            obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
            obj.likes_to_woof.is_a?(Boolean) != false || raise("Passed value for field obj.likes_to_woof is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
