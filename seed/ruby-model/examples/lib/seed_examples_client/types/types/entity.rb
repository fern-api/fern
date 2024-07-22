# frozen_string_literal: true

require_relative "../type"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Entity
      # @return [SeedExamplesClient::Type]
      attr_reader :type
      # @return [String]
      attr_reader :name
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param type [SeedExamplesClient::Type]
      # @param name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Entity]
      def initialize(type:, name:, additional_properties: nil)
        @type = type
        @name = name
        @additional_properties = additional_properties
        @_field_set = { "type": type, "name": name }
      end

      # Deserialize a JSON object to an instance of Entity
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Entity]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["type"].nil?
          type = nil
        else
          type = parsed_json["type"].to_json
          type = SeedExamplesClient::Type.from_json(json_object: type)
        end
        name = parsed_json["name"]
        new(
          type: type,
          name: name,
          additional_properties: struct
        )
      end

      # Serialize an instance of Entity to a JSON object
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
        SeedExamplesClient::Type.validate_raw(obj: obj.type)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      end
    end
  end
end
