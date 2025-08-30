# frozen_string_literal: true

require "date"
require_relative "address"
require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    # Test object with nullable and optional fields
    class UserProfile
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :username
      # @return [String]
      attr_reader :nullable_string
      # @return [Integer]
      attr_reader :nullable_integer
      # @return [Boolean]
      attr_reader :nullable_boolean
      # @return [DateTime]
      attr_reader :nullable_date
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      attr_reader :nullable_object
      # @return [Array<String>]
      attr_reader :nullable_list
      # @return [Hash{String => String}]
      attr_reader :nullable_map
      # @return [String]
      attr_reader :optional_string
      # @return [Integer]
      attr_reader :optional_integer
      # @return [Boolean]
      attr_reader :optional_boolean
      # @return [DateTime]
      attr_reader :optional_date
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      attr_reader :optional_object
      # @return [Array<String>]
      attr_reader :optional_list
      # @return [Hash{String => String}]
      attr_reader :optional_map
      # @return [String]
      attr_reader :optional_nullable_string
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      attr_reader :optional_nullable_object
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param username [String]
      # @param nullable_string [String]
      # @param nullable_integer [Integer]
      # @param nullable_boolean [Boolean]
      # @param nullable_date [DateTime]
      # @param nullable_object [SeedNullableOptionalClient::NullableOptional::Address]
      # @param nullable_list [Array<String>]
      # @param nullable_map [Hash{String => String}]
      # @param optional_string [String]
      # @param optional_integer [Integer]
      # @param optional_boolean [Boolean]
      # @param optional_date [DateTime]
      # @param optional_object [SeedNullableOptionalClient::NullableOptional::Address]
      # @param optional_list [Array<String>]
      # @param optional_map [Hash{String => String}]
      # @param optional_nullable_string [String]
      # @param optional_nullable_object [SeedNullableOptionalClient::NullableOptional::Address]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::UserProfile]
      def initialize(id:, username:, nullable_string: OMIT, nullable_integer: OMIT, nullable_boolean: OMIT,
                     nullable_date: OMIT, nullable_object: OMIT, nullable_list: OMIT, nullable_map: OMIT, optional_string: OMIT, optional_integer: OMIT, optional_boolean: OMIT, optional_date: OMIT, optional_object: OMIT, optional_list: OMIT, optional_map: OMIT, optional_nullable_string: OMIT, optional_nullable_object: OMIT, additional_properties: nil)
        @id = id
        @username = username
        @nullable_string = nullable_string if nullable_string != OMIT
        @nullable_integer = nullable_integer if nullable_integer != OMIT
        @nullable_boolean = nullable_boolean if nullable_boolean != OMIT
        @nullable_date = nullable_date if nullable_date != OMIT
        @nullable_object = nullable_object if nullable_object != OMIT
        @nullable_list = nullable_list if nullable_list != OMIT
        @nullable_map = nullable_map if nullable_map != OMIT
        @optional_string = optional_string if optional_string != OMIT
        @optional_integer = optional_integer if optional_integer != OMIT
        @optional_boolean = optional_boolean if optional_boolean != OMIT
        @optional_date = optional_date if optional_date != OMIT
        @optional_object = optional_object if optional_object != OMIT
        @optional_list = optional_list if optional_list != OMIT
        @optional_map = optional_map if optional_map != OMIT
        @optional_nullable_string = optional_nullable_string if optional_nullable_string != OMIT
        @optional_nullable_object = optional_nullable_object if optional_nullable_object != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "id": id,
          "username": username,
          "nullableString": nullable_string,
          "nullableInteger": nullable_integer,
          "nullableBoolean": nullable_boolean,
          "nullableDate": nullable_date,
          "nullableObject": nullable_object,
          "nullableList": nullable_list,
          "nullableMap": nullable_map,
          "optionalString": optional_string,
          "optionalInteger": optional_integer,
          "optionalBoolean": optional_boolean,
          "optionalDate": optional_date,
          "optionalObject": optional_object,
          "optionalList": optional_list,
          "optionalMap": optional_map,
          "optionalNullableString": optional_nullable_string,
          "optionalNullableObject": optional_nullable_object
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of UserProfile
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::UserProfile]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        username = parsed_json["username"]
        nullable_string = parsed_json["nullableString"]
        nullable_integer = parsed_json["nullableInteger"]
        nullable_boolean = parsed_json["nullableBoolean"]
        nullable_date = (DateTime.parse(parsed_json["nullableDate"]) unless parsed_json["nullableDate"].nil?)
        if parsed_json["nullableObject"].nil?
          nullable_object = nil
        else
          nullable_object = parsed_json["nullableObject"].to_json
          nullable_object = SeedNullableOptionalClient::NullableOptional::Address.from_json(json_object: nullable_object)
        end
        nullable_list = parsed_json["nullableList"]
        nullable_map = parsed_json["nullableMap"]
        optional_string = parsed_json["optionalString"]
        optional_integer = parsed_json["optionalInteger"]
        optional_boolean = parsed_json["optionalBoolean"]
        optional_date = (DateTime.parse(parsed_json["optionalDate"]) unless parsed_json["optionalDate"].nil?)
        if parsed_json["optionalObject"].nil?
          optional_object = nil
        else
          optional_object = parsed_json["optionalObject"].to_json
          optional_object = SeedNullableOptionalClient::NullableOptional::Address.from_json(json_object: optional_object)
        end
        optional_list = parsed_json["optionalList"]
        optional_map = parsed_json["optionalMap"]
        optional_nullable_string = parsed_json["optionalNullableString"]
        if parsed_json["optionalNullableObject"].nil?
          optional_nullable_object = nil
        else
          optional_nullable_object = parsed_json["optionalNullableObject"].to_json
          optional_nullable_object = SeedNullableOptionalClient::NullableOptional::Address.from_json(json_object: optional_nullable_object)
        end
        new(
          id: id,
          username: username,
          nullable_string: nullable_string,
          nullable_integer: nullable_integer,
          nullable_boolean: nullable_boolean,
          nullable_date: nullable_date,
          nullable_object: nullable_object,
          nullable_list: nullable_list,
          nullable_map: nullable_map,
          optional_string: optional_string,
          optional_integer: optional_integer,
          optional_boolean: optional_boolean,
          optional_date: optional_date,
          optional_object: optional_object,
          optional_list: optional_list,
          optional_map: optional_map,
          optional_nullable_string: optional_nullable_string,
          optional_nullable_object: optional_nullable_object,
          additional_properties: struct
        )
      end

      # Serialize an instance of UserProfile to a JSON object
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
        obj.nullable_string&.is_a?(String) != false || raise("Passed value for field obj.nullable_string is not the expected type, validation failed.")
        obj.nullable_integer&.is_a?(Integer) != false || raise("Passed value for field obj.nullable_integer is not the expected type, validation failed.")
        obj.nullable_boolean&.is_a?(Boolean) != false || raise("Passed value for field obj.nullable_boolean is not the expected type, validation failed.")
        obj.nullable_date&.is_a?(DateTime) != false || raise("Passed value for field obj.nullable_date is not the expected type, validation failed.")
        obj.nullable_object.nil? || SeedNullableOptionalClient::NullableOptional::Address.validate_raw(obj: obj.nullable_object)
        obj.nullable_list&.is_a?(Array) != false || raise("Passed value for field obj.nullable_list is not the expected type, validation failed.")
        obj.nullable_map&.is_a?(Hash) != false || raise("Passed value for field obj.nullable_map is not the expected type, validation failed.")
        obj.optional_string&.is_a?(String) != false || raise("Passed value for field obj.optional_string is not the expected type, validation failed.")
        obj.optional_integer&.is_a?(Integer) != false || raise("Passed value for field obj.optional_integer is not the expected type, validation failed.")
        obj.optional_boolean&.is_a?(Boolean) != false || raise("Passed value for field obj.optional_boolean is not the expected type, validation failed.")
        obj.optional_date&.is_a?(DateTime) != false || raise("Passed value for field obj.optional_date is not the expected type, validation failed.")
        obj.optional_object.nil? || SeedNullableOptionalClient::NullableOptional::Address.validate_raw(obj: obj.optional_object)
        obj.optional_list&.is_a?(Array) != false || raise("Passed value for field obj.optional_list is not the expected type, validation failed.")
        obj.optional_map&.is_a?(Hash) != false || raise("Passed value for field obj.optional_map is not the expected type, validation failed.")
        obj.optional_nullable_string&.is_a?(String) != false || raise("Passed value for field obj.optional_nullable_string is not the expected type, validation failed.")
        obj.optional_nullable_object.nil? || SeedNullableOptionalClient::NullableOptional::Address.validate_raw(obj: obj.optional_nullable_object)
      end
    end
  end
end
