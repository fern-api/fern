# frozen_string_literal: true
require "types/types/MigrationStatus"
require "json"

module SeedClient
  module Types
    class Migration
      attr_reader :name, :status, :additional_properties
      # @param name [String] 
      # @param status [Types::MigrationStatus] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Migration] 
      def initialze(name:, status:, additional_properties: nil)
        # @type [String] 
        @name = name
        # @type [Types::MigrationStatus] 
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
        name struct.name
        status Types::MigrationStatus.from_json(json_object: struct.status)
        new(name: name, status: status, additional_properties: struct)
      end
      # Serialize an instance of Migration to a JSON object
      #
      # @return [JSON] 
      def to_json
        { name: @name, status: @status }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        MigrationStatus.validate_raw(obj: obj.status)
      end
    end
  end
end