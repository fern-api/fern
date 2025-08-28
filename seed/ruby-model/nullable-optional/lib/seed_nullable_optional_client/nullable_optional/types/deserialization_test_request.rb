# frozen_string_literal: true

require_relative "user_role"
require_relative "user_status"
require_relative "notification_method"
require_relative "search_result"
require_relative "address"
require_relative "organization"
require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    # Request body for testing deserialization of null values
    class DeserializationTestRequest
      # @return [String]
      attr_reader :required_string
      # @return [String]
      attr_reader :nullable_string
      # @return [String]
      attr_reader :optional_string
      # @return [String]
      attr_reader :optional_nullable_string
      # @return [SeedNullableOptionalClient::NullableOptional::UserRole]
      attr_reader :nullable_enum
      # @return [SeedNullableOptionalClient::NullableOptional::UserStatus]
      attr_reader :optional_enum
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      attr_reader :nullable_union
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      attr_reader :optional_union
      # @return [Array<String>]
      attr_reader :nullable_list
      # @return [Hash{String => Integer}]
      attr_reader :nullable_map
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      attr_reader :nullable_object
      # @return [SeedNullableOptionalClient::NullableOptional::Organization]
      attr_reader :optional_object
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param required_string [String]
      # @param nullable_string [String]
      # @param optional_string [String]
      # @param optional_nullable_string [String]
      # @param nullable_enum [SeedNullableOptionalClient::NullableOptional::UserRole]
      # @param optional_enum [SeedNullableOptionalClient::NullableOptional::UserStatus]
      # @param nullable_union [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      # @param optional_union [SeedNullableOptionalClient::NullableOptional::SearchResult]
      # @param nullable_list [Array<String>]
      # @param nullable_map [Hash{String => Integer}]
      # @param nullable_object [SeedNullableOptionalClient::NullableOptional::Address]
      # @param optional_object [SeedNullableOptionalClient::NullableOptional::Organization]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::DeserializationTestRequest]
      def initialize(required_string:, nullable_string: OMIT, optional_string: OMIT, optional_nullable_string: OMIT,
                     nullable_enum: OMIT, optional_enum: OMIT, nullable_union: OMIT, optional_union: OMIT, nullable_list: OMIT, nullable_map: OMIT, nullable_object: OMIT, optional_object: OMIT, additional_properties: nil)
        @required_string = required_string
        @nullable_string = nullable_string if nullable_string != OMIT
        @optional_string = optional_string if optional_string != OMIT
        @optional_nullable_string = optional_nullable_string if optional_nullable_string != OMIT
        @nullable_enum = nullable_enum if nullable_enum != OMIT
        @optional_enum = optional_enum if optional_enum != OMIT
        @nullable_union = nullable_union if nullable_union != OMIT
        @optional_union = optional_union if optional_union != OMIT
        @nullable_list = nullable_list if nullable_list != OMIT
        @nullable_map = nullable_map if nullable_map != OMIT
        @nullable_object = nullable_object if nullable_object != OMIT
        @optional_object = optional_object if optional_object != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "requiredString": required_string,
          "nullableString": nullable_string,
          "optionalString": optional_string,
          "optionalNullableString": optional_nullable_string,
          "nullableEnum": nullable_enum,
          "optionalEnum": optional_enum,
          "nullableUnion": nullable_union,
          "optionalUnion": optional_union,
          "nullableList": nullable_list,
          "nullableMap": nullable_map,
          "nullableObject": nullable_object,
          "optionalObject": optional_object
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of DeserializationTestRequest
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::DeserializationTestRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        required_string = parsed_json["requiredString"]
        nullable_string = parsed_json["nullableString"]
        optional_string = parsed_json["optionalString"]
        optional_nullable_string = parsed_json["optionalNullableString"]
        nullable_enum = parsed_json["nullableEnum"]
        optional_enum = parsed_json["optionalEnum"]
        if parsed_json["nullableUnion"].nil?
          nullable_union = nil
        else
          nullable_union = parsed_json["nullableUnion"].to_json
          nullable_union = SeedNullableOptionalClient::NullableOptional::NotificationMethod.from_json(json_object: nullable_union)
        end
        if parsed_json["optionalUnion"].nil?
          optional_union = nil
        else
          optional_union = parsed_json["optionalUnion"].to_json
          optional_union = SeedNullableOptionalClient::NullableOptional::SearchResult.from_json(json_object: optional_union)
        end
        nullable_list = parsed_json["nullableList"]
        nullable_map = parsed_json["nullableMap"]
        if parsed_json["nullableObject"].nil?
          nullable_object = nil
        else
          nullable_object = parsed_json["nullableObject"].to_json
          nullable_object = SeedNullableOptionalClient::NullableOptional::Address.from_json(json_object: nullable_object)
        end
        if parsed_json["optionalObject"].nil?
          optional_object = nil
        else
          optional_object = parsed_json["optionalObject"].to_json
          optional_object = SeedNullableOptionalClient::NullableOptional::Organization.from_json(json_object: optional_object)
        end
        new(
          required_string: required_string,
          nullable_string: nullable_string,
          optional_string: optional_string,
          optional_nullable_string: optional_nullable_string,
          nullable_enum: nullable_enum,
          optional_enum: optional_enum,
          nullable_union: nullable_union,
          optional_union: optional_union,
          nullable_list: nullable_list,
          nullable_map: nullable_map,
          nullable_object: nullable_object,
          optional_object: optional_object,
          additional_properties: struct
        )
      end

      # Serialize an instance of DeserializationTestRequest to a JSON object
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
        obj.required_string.is_a?(String) != false || raise("Passed value for field obj.required_string is not the expected type, validation failed.")
        obj.nullable_string&.is_a?(String) != false || raise("Passed value for field obj.nullable_string is not the expected type, validation failed.")
        obj.optional_string&.is_a?(String) != false || raise("Passed value for field obj.optional_string is not the expected type, validation failed.")
        obj.optional_nullable_string&.is_a?(String) != false || raise("Passed value for field obj.optional_nullable_string is not the expected type, validation failed.")
        obj.nullable_enum&.is_a?(SeedNullableOptionalClient::NullableOptional::UserRole) != false || raise("Passed value for field obj.nullable_enum is not the expected type, validation failed.")
        obj.optional_enum&.is_a?(SeedNullableOptionalClient::NullableOptional::UserStatus) != false || raise("Passed value for field obj.optional_enum is not the expected type, validation failed.")
        obj.nullable_union.nil? || SeedNullableOptionalClient::NullableOptional::NotificationMethod.validate_raw(obj: obj.nullable_union)
        obj.optional_union.nil? || SeedNullableOptionalClient::NullableOptional::SearchResult.validate_raw(obj: obj.optional_union)
        obj.nullable_list&.is_a?(Array) != false || raise("Passed value for field obj.nullable_list is not the expected type, validation failed.")
        obj.nullable_map&.is_a?(Hash) != false || raise("Passed value for field obj.nullable_map is not the expected type, validation failed.")
        obj.nullable_object.nil? || SeedNullableOptionalClient::NullableOptional::Address.validate_raw(obj: obj.nullable_object)
        obj.optional_object.nil? || SeedNullableOptionalClient::NullableOptional::Organization.validate_raw(obj: obj.optional_object)
      end
    end
  end
end
