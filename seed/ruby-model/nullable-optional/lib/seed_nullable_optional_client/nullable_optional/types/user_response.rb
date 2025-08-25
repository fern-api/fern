# frozen_string_literal: true

require "date"
require_relative "address"
require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    class UserResponse
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :username
      # @return [String]
      attr_reader :email
      # @return [String]
      attr_reader :phone
      # @return [DateTime]
      attr_reader :created_at
      # @return [DateTime]
      attr_reader :updated_at
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      attr_reader :address
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param username [String]
      # @param email [String]
      # @param phone [String]
      # @param created_at [DateTime]
      # @param updated_at [DateTime]
      # @param address [SeedNullableOptionalClient::NullableOptional::Address]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::UserResponse]
      def initialize(id:, username:, created_at:, email: OMIT, phone: OMIT, updated_at: OMIT, address: OMIT,
                     additional_properties: nil)
        @id = id
        @username = username
        @email = email if email != OMIT
        @phone = phone if phone != OMIT
        @created_at = created_at
        @updated_at = updated_at if updated_at != OMIT
        @address = address if address != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "id": id,
          "username": username,
          "email": email,
          "phone": phone,
          "createdAt": created_at,
          "updatedAt": updated_at,
          "address": address
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of UserResponse
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::UserResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        username = parsed_json["username"]
        email = parsed_json["email"]
        phone = parsed_json["phone"]
        created_at = (DateTime.parse(parsed_json["createdAt"]) unless parsed_json["createdAt"].nil?)
        updated_at = (DateTime.parse(parsed_json["updatedAt"]) unless parsed_json["updatedAt"].nil?)
        if parsed_json["address"].nil?
          address = nil
        else
          address = parsed_json["address"].to_json
          address = SeedNullableOptionalClient::NullableOptional::Address.from_json(json_object: address)
        end
        new(
          id: id,
          username: username,
          email: email,
          phone: phone,
          created_at: created_at,
          updated_at: updated_at,
          address: address,
          additional_properties: struct
        )
      end

      # Serialize an instance of UserResponse to a JSON object
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
        obj.username.is_a?(String) != false || raise("Passed value for field obj.username is not the expected type, validation failed.")
        obj.email&.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
        obj.phone&.is_a?(String) != false || raise("Passed value for field obj.phone is not the expected type, validation failed.")
        obj.created_at.is_a?(DateTime) != false || raise("Passed value for field obj.created_at is not the expected type, validation failed.")
        obj.updated_at&.is_a?(DateTime) != false || raise("Passed value for field obj.updated_at is not the expected type, validation failed.")
        obj.address.nil? || SeedNullableOptionalClient::NullableOptional::Address.validate_raw(obj: obj.address)
      end
    end
  end
end
