# frozen_string_literal: true

require "date"
require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    class Resource
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :name
      # @return [String]
      attr_reader :description
      # @return [DateTime]
      attr_reader :created_at
      # @return [DateTime]
      attr_reader :updated_at
      # @return [Hash{String => Object}]
      attr_reader :metadata
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param name [String]
      # @param description [String]
      # @param created_at [DateTime]
      # @param updated_at [DateTime]
      # @param metadata [Hash{String => Object}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::Resource]
      def initialize(id:, name:, created_at:, updated_at:, description: OMIT, metadata: OMIT,
                     additional_properties: nil)
        @id = id
        @name = name
        @description = description if description != OMIT
        @created_at = created_at
        @updated_at = updated_at
        @metadata = metadata if metadata != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "id": id,
          "name": name,
          "description": description,
          "created_at": created_at,
          "updated_at": updated_at,
          "metadata": metadata
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Resource
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::Resource]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        name = parsed_json["name"]
        description = parsed_json["description"]
        created_at = (DateTime.parse(parsed_json["created_at"]) unless parsed_json["created_at"].nil?)
        updated_at = (DateTime.parse(parsed_json["updated_at"]) unless parsed_json["updated_at"].nil?)
        metadata = parsed_json["metadata"]
        new(
          id: id,
          name: name,
          description: description,
          created_at: created_at,
          updated_at: updated_at,
          metadata: metadata,
          additional_properties: struct
        )
      end

      # Serialize an instance of Resource to a JSON object
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
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.description&.is_a?(String) != false || raise("Passed value for field obj.description is not the expected type, validation failed.")
        obj.created_at.is_a?(DateTime) != false || raise("Passed value for field obj.created_at is not the expected type, validation failed.")
        obj.updated_at.is_a?(DateTime) != false || raise("Passed value for field obj.updated_at is not the expected type, validation failed.")
        obj.metadata&.is_a?(Hash) != false || raise("Passed value for field obj.metadata is not the expected type, validation failed.")
      end
    end
  end
end
