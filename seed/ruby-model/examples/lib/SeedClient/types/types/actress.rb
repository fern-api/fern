# frozen_string_literal: true

require "json"

module SeedClient
  module Types
    class Actress
      attr_reader :name, :id, :additional_properties

      # @param name [String]
      # @param id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Actress]
      def initialize(name:, id:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [String]
        @id = id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Actress
      #
      # @param json_object [JSON]
      # @return [Types::Actress]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        id = struct.id
        new(name: name, id: id, additional_properties: struct)
      end

      # Serialize an instance of Actress to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "id": @id }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
