# frozen_string_literal: true

require_relative "migration_status"
require "json"

module SeedExamplesClient
  module Types
    class Migration
      attr_reader :name, :status, :additional_properties

      # @param name [String]
      # @param status [MIGRATION_STATUS]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Migration]
      def initialize(name:, status:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [MIGRATION_STATUS]
        @status = status
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Migration
      #
      # @param json_object [JSON]
      # @return [Types::Migration]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = struct.name
        status = Types::MIGRATION_STATUS.key(parsed_json["status"]) || parsed_json["status"]
        new(name: name, status: status, additional_properties: struct)
      end

      # Serialize an instance of Migration to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "status": Types::MIGRATION_STATUS[@status] || @status }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.status.is_a?(Types::MIGRATION_STATUS) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      end
    end
  end
end
