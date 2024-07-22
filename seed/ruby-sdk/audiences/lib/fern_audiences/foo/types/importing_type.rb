# frozen_string_literal: true

require "ostruct"
require "json"

module SeedAudiencesClient
  class Foo
    class ImportingType
      # @return [String]
      attr_reader :imported
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param imported [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedAudiencesClient::Foo::ImportingType]
      def initialize(imported:, additional_properties: nil)
        @imported = imported
        @additional_properties = additional_properties
        @_field_set = { "imported": imported }
      end

      # Deserialize a JSON object to an instance of ImportingType
      #
      # @param json_object [String]
      # @return [SeedAudiencesClient::Foo::ImportingType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        imported = parsed_json["imported"]
        new(imported: imported, additional_properties: struct)
      end

      # Serialize an instance of ImportingType to a JSON object
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
        obj.imported.is_a?(String) != false || raise("Passed value for field obj.imported is not the expected type, validation failed.")
      end
    end
  end
end
