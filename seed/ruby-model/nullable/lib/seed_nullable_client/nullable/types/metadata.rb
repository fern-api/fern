# frozen_string_literal: true

require "date"
require_relative "status"
require "ostruct"
require "json"

module SeedNullableClient
  class Nullable
    class Metadata
      # @return [DateTime]
      attr_reader :created_at
      # @return [DateTime]
      attr_reader :updated_at
      # @return [String]
      attr_reader :avatar
      # @return [Boolean]
      attr_reader :activated
      # @return [SeedNullableClient::Nullable::Status]
      attr_reader :status
      # @return [Hash{String => String}]
      attr_reader :values
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param created_at [DateTime]
      # @param updated_at [DateTime]
      # @param avatar [String]
      # @param activated [Boolean]
      # @param status [SeedNullableClient::Nullable::Status]
      # @param values [Hash{String => String}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableClient::Nullable::Metadata]
      def initialize(created_at:, updated_at:, status:, avatar: OMIT, activated: OMIT, values: OMIT,
                     additional_properties: nil)
        @created_at = created_at
        @updated_at = updated_at
        @avatar = avatar if avatar != OMIT
        @activated = activated if activated != OMIT
        @status = status
        @values = values if values != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "createdAt": created_at,
          "updatedAt": updated_at,
          "avatar": avatar,
          "activated": activated,
          "status": status,
          "values": values
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Metadata
      #
      # @param json_object [String]
      # @return [SeedNullableClient::Nullable::Metadata]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        created_at = (DateTime.parse(parsed_json["createdAt"]) unless parsed_json["createdAt"].nil?)
        updated_at = (DateTime.parse(parsed_json["updatedAt"]) unless parsed_json["updatedAt"].nil?)
        avatar = parsed_json["avatar"]
        activated = parsed_json["activated"]
        if parsed_json["status"].nil?
          status = nil
        else
          status = parsed_json["status"].to_json
          status = SeedNullableClient::Nullable::Status.from_json(json_object: status)
        end
        values = parsed_json["values"]
        new(
          created_at: created_at,
          updated_at: updated_at,
          avatar: avatar,
          activated: activated,
          status: status,
          values: values,
          additional_properties: struct
        )
      end

      # Serialize an instance of Metadata to a JSON object
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
        obj.created_at.is_a?(DateTime) != false || raise("Passed value for field obj.created_at is not the expected type, validation failed.")
        obj.updated_at.is_a?(DateTime) != false || raise("Passed value for field obj.updated_at is not the expected type, validation failed.")
        obj.avatar&.is_a?(String) != false || raise("Passed value for field obj.avatar is not the expected type, validation failed.")
        obj.activated&.is_a?(Boolean) != false || raise("Passed value for field obj.activated is not the expected type, validation failed.")
        SeedNullableClient::Nullable::Status.validate_raw(obj: obj.status)
        obj.values&.is_a?(Hash) != false || raise("Passed value for field obj.values is not the expected type, validation failed.")
      end
    end
  end
end
