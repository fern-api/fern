# frozen_string_literal: true

require_relative "../../commons/types/imported"
require "json"

module SeedAudiencesClient
  module Foo
    class ImportingType
      attr_reader :imported, :additional_properties

      # @param imported [Commons::IMPORTED]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Foo::ImportingType]
      def initialize(imported:, additional_properties: nil)
        # @type [Commons::IMPORTED]
        @imported = imported
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ImportingType
      #
      # @param json_object [JSON]
      # @return [Foo::ImportingType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        imported = struct.imported
        new(imported: imported, additional_properties: struct)
      end

      # Serialize an instance of ImportingType to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "imported": @imported }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.imported.is_a?(String) != false || raise("Passed value for field obj.imported is not the expected type, validation failed.")
      end
    end
  end
end
