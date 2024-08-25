# frozen_string_literal: true

require_relative "migration_status"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Migration
      # @return [String]
      attr_reader :name
      # @return [SeedExamplesClient::Types::MigrationStatus]
      attr_reader :status
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param status [SeedExamplesClient::Types::MigrationStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Migration]
      def initialize(name:, status:, additional_properties: nil)
        @name = name
        @status = status
        @additional_properties = additional_properties
        @_field_set = { "name": name, "status": status }
      end

      # Deserialize a JSON object to an instance of Migration
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Migration]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        status = parsed_json["status"]
        new(
          name: name,
          status: status,
          additional_properties: struct
        )
      end

      # Serialize an instance of Migration to a JSON object
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
        obj.status.is_a?(SeedExamplesClient::Types::MigrationStatus) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      end
    end
  end
end
