# frozen_string_literal: true

module SeedClient
  module Migration
    class Migration
      attr_reader :name, :status, :additional_properties

      # @param name [String]
      # @param status [Migration::MigrationStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Migration::Migration]
      def initialze(name:, status:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [Migration::MigrationStatus]
        @status = status
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Migration
      #
      # @param json_object [JSON]
      # @return [Migration::Migration]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        status = Migration::MigrationStatus.from_json(json_object: struct.status)
        new(name: name, status: status, additional_properties: struct)
      end

      # Serialize an instance of Migration to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          name: @name,
          status: @status
        }.to_json
      end
    end
  end
end
