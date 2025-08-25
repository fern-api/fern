# frozen_string_literal: true

require_relative "address"
require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    class CreateUserRequest
      # @return [String]
      attr_reader :username
      # @return [String]
      attr_reader :email
      # @return [String]
      attr_reader :phone
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      attr_reader :address
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param username [String]
      # @param email [String]
      # @param phone [String]
      # @param address [SeedNullableOptionalClient::NullableOptional::Address]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::CreateUserRequest]
      def initialize(username:, email: OMIT, phone: OMIT, address: OMIT, additional_properties: nil)
        @username = username
        @email = email if email != OMIT
        @phone = phone if phone != OMIT
        @address = address if address != OMIT
        @additional_properties = additional_properties
        @_field_set = { "username": username, "email": email, "phone": phone, "address": address }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of CreateUserRequest
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::CreateUserRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        username = parsed_json["username"]
        email = parsed_json["email"]
        phone = parsed_json["phone"]
        if parsed_json["address"].nil?
          address = nil
        else
          address = parsed_json["address"].to_json
          address = SeedNullableOptionalClient::NullableOptional::Address.from_json(json_object: address)
        end
        new(
          username: username,
          email: email,
          phone: phone,
          address: address,
          additional_properties: struct
        )
      end

      # Serialize an instance of CreateUserRequest to a JSON object
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
        obj.username.is_a?(String) != false || raise("Passed value for field obj.username is not the expected type, validation failed.")
        obj.email&.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
        obj.phone&.is_a?(String) != false || raise("Passed value for field obj.phone is not the expected type, validation failed.")
        obj.address.nil? || SeedNullableOptionalClient::NullableOptional::Address.validate_raw(obj: obj.address)
      end
    end
  end
end
