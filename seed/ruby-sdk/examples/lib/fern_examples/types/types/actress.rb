# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Actress
      # @return [String]
      attr_reader :name
      # @return [String]
      attr_reader :id
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Actress]
      def initialize(name:, id:, additional_properties: nil)
        @name = name
        @id = id
        @additional_properties = additional_properties
        @_field_set = { "name": name, "id": id }
      end

      # Deserialize a JSON object to an instance of Actress
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Actress]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        id = parsed_json["id"]
        new(
          name: name,
          id: id,
          additional_properties: struct
        )
      end

      # Serialize an instance of Actress to a JSON object
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
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      end
    end
  end
end
