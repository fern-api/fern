# frozen_string_literal: true

require_relative "user_role"
require_relative "user_status"
require_relative "notification_method"
require_relative "search_result"
require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    # Test object with nullable enums, unions, and arrays
    class ComplexProfile
      # @return [String]
      attr_reader :id
      # @return [SeedNullableOptionalClient::NullableOptional::UserRole]
      attr_reader :nullable_role
      # @return [SeedNullableOptionalClient::NullableOptional::UserRole]
      attr_reader :optional_role
      # @return [SeedNullableOptionalClient::NullableOptional::UserRole]
      attr_reader :optional_nullable_role
      # @return [SeedNullableOptionalClient::NullableOptional::UserStatus]
      attr_reader :nullable_status
      # @return [SeedNullableOptionalClient::NullableOptional::UserStatus]
      attr_reader :optional_status
      # @return [SeedNullableOptionalClient::NullableOptional::UserStatus]
      attr_reader :optional_nullable_status
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      attr_reader :nullable_notification
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      attr_reader :optional_notification
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      attr_reader :optional_nullable_notification
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      attr_reader :nullable_search_result
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      attr_reader :optional_search_result
      # @return [Array<String>]
      attr_reader :nullable_array
      # @return [Array<String>]
      attr_reader :optional_array
      # @return [Array<String>]
      attr_reader :optional_nullable_array
      # @return [Array<String>]
      attr_reader :nullable_list_of_nullables
      # @return [Hash{String => SeedNullableOptionalClient::NullableOptional::Address}]
      attr_reader :nullable_map_of_nullables
      # @return [Array<SeedNullableOptionalClient::NullableOptional::NotificationMethod>]
      attr_reader :nullable_list_of_unions
      # @return [Hash{String => SeedNullableOptionalClient::NullableOptional::UserRole}]
      attr_reader :optional_map_of_enums
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param nullable_role [SeedNullableOptionalClient::NullableOptional::UserRole]
      # @param optional_role [SeedNullableOptionalClient::NullableOptional::UserRole]
      # @param optional_nullable_role [SeedNullableOptionalClient::NullableOptional::UserRole]
      # @param nullable_status [SeedNullableOptionalClient::NullableOptional::UserStatus]
      # @param optional_status [SeedNullableOptionalClient::NullableOptional::UserStatus]
      # @param optional_nullable_status [SeedNullableOptionalClient::NullableOptional::UserStatus]
      # @param nullable_notification [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      # @param optional_notification [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      # @param optional_nullable_notification [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      # @param nullable_search_result [SeedNullableOptionalClient::NullableOptional::SearchResult]
      # @param optional_search_result [SeedNullableOptionalClient::NullableOptional::SearchResult]
      # @param nullable_array [Array<String>]
      # @param optional_array [Array<String>]
      # @param optional_nullable_array [Array<String>]
      # @param nullable_list_of_nullables [Array<String>]
      # @param nullable_map_of_nullables [Hash{String => SeedNullableOptionalClient::NullableOptional::Address}]
      # @param nullable_list_of_unions [Array<SeedNullableOptionalClient::NullableOptional::NotificationMethod>]
      # @param optional_map_of_enums [Hash{String => SeedNullableOptionalClient::NullableOptional::UserRole}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::ComplexProfile]
      def initialize(id:, nullable_role: OMIT, optional_role: OMIT, optional_nullable_role: OMIT,
                     nullable_status: OMIT, optional_status: OMIT, optional_nullable_status: OMIT, nullable_notification: OMIT, optional_notification: OMIT, optional_nullable_notification: OMIT, nullable_search_result: OMIT, optional_search_result: OMIT, nullable_array: OMIT, optional_array: OMIT, optional_nullable_array: OMIT, nullable_list_of_nullables: OMIT, nullable_map_of_nullables: OMIT, nullable_list_of_unions: OMIT, optional_map_of_enums: OMIT, additional_properties: nil)
        @id = id
        @nullable_role = nullable_role if nullable_role != OMIT
        @optional_role = optional_role if optional_role != OMIT
        @optional_nullable_role = optional_nullable_role if optional_nullable_role != OMIT
        @nullable_status = nullable_status if nullable_status != OMIT
        @optional_status = optional_status if optional_status != OMIT
        @optional_nullable_status = optional_nullable_status if optional_nullable_status != OMIT
        @nullable_notification = nullable_notification if nullable_notification != OMIT
        @optional_notification = optional_notification if optional_notification != OMIT
        @optional_nullable_notification = optional_nullable_notification if optional_nullable_notification != OMIT
        @nullable_search_result = nullable_search_result if nullable_search_result != OMIT
        @optional_search_result = optional_search_result if optional_search_result != OMIT
        @nullable_array = nullable_array if nullable_array != OMIT
        @optional_array = optional_array if optional_array != OMIT
        @optional_nullable_array = optional_nullable_array if optional_nullable_array != OMIT
        @nullable_list_of_nullables = nullable_list_of_nullables if nullable_list_of_nullables != OMIT
        @nullable_map_of_nullables = nullable_map_of_nullables if nullable_map_of_nullables != OMIT
        @nullable_list_of_unions = nullable_list_of_unions if nullable_list_of_unions != OMIT
        @optional_map_of_enums = optional_map_of_enums if optional_map_of_enums != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "id": id,
          "nullableRole": nullable_role,
          "optionalRole": optional_role,
          "optionalNullableRole": optional_nullable_role,
          "nullableStatus": nullable_status,
          "optionalStatus": optional_status,
          "optionalNullableStatus": optional_nullable_status,
          "nullableNotification": nullable_notification,
          "optionalNotification": optional_notification,
          "optionalNullableNotification": optional_nullable_notification,
          "nullableSearchResult": nullable_search_result,
          "optionalSearchResult": optional_search_result,
          "nullableArray": nullable_array,
          "optionalArray": optional_array,
          "optionalNullableArray": optional_nullable_array,
          "nullableListOfNullables": nullable_list_of_nullables,
          "nullableMapOfNullables": nullable_map_of_nullables,
          "nullableListOfUnions": nullable_list_of_unions,
          "optionalMapOfEnums": optional_map_of_enums
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of ComplexProfile
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::ComplexProfile]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        nullable_role = parsed_json["nullableRole"]
        optional_role = parsed_json["optionalRole"]
        optional_nullable_role = parsed_json["optionalNullableRole"]
        nullable_status = parsed_json["nullableStatus"]
        optional_status = parsed_json["optionalStatus"]
        optional_nullable_status = parsed_json["optionalNullableStatus"]
        if parsed_json["nullableNotification"].nil?
          nullable_notification = nil
        else
          nullable_notification = parsed_json["nullableNotification"].to_json
          nullable_notification = SeedNullableOptionalClient::NullableOptional::NotificationMethod.from_json(json_object: nullable_notification)
        end
        if parsed_json["optionalNotification"].nil?
          optional_notification = nil
        else
          optional_notification = parsed_json["optionalNotification"].to_json
          optional_notification = SeedNullableOptionalClient::NullableOptional::NotificationMethod.from_json(json_object: optional_notification)
        end
        if parsed_json["optionalNullableNotification"].nil?
          optional_nullable_notification = nil
        else
          optional_nullable_notification = parsed_json["optionalNullableNotification"].to_json
          optional_nullable_notification = SeedNullableOptionalClient::NullableOptional::NotificationMethod.from_json(json_object: optional_nullable_notification)
        end
        if parsed_json["nullableSearchResult"].nil?
          nullable_search_result = nil
        else
          nullable_search_result = parsed_json["nullableSearchResult"].to_json
          nullable_search_result = SeedNullableOptionalClient::NullableOptional::SearchResult.from_json(json_object: nullable_search_result)
        end
        if parsed_json["optionalSearchResult"].nil?
          optional_search_result = nil
        else
          optional_search_result = parsed_json["optionalSearchResult"].to_json
          optional_search_result = SeedNullableOptionalClient::NullableOptional::SearchResult.from_json(json_object: optional_search_result)
        end
        nullable_array = parsed_json["nullableArray"]
        optional_array = parsed_json["optionalArray"]
        optional_nullable_array = parsed_json["optionalNullableArray"]
        nullable_list_of_nullables = parsed_json["nullableListOfNullables"]
        nullable_map_of_nullables = parsed_json["nullableMapOfNullables"]&.transform_values do |value|
          value = value.to_json
          SeedNullableOptionalClient::NullableOptional::Address.from_json(json_object: value)
        end
        nullable_list_of_unions = parsed_json["nullableListOfUnions"]&.map do |item|
          item = item.to_json
          SeedNullableOptionalClient::NullableOptional::NotificationMethod.from_json(json_object: item)
        end
        optional_map_of_enums = parsed_json["optionalMapOfEnums"]
        new(
          id: id,
          nullable_role: nullable_role,
          optional_role: optional_role,
          optional_nullable_role: optional_nullable_role,
          nullable_status: nullable_status,
          optional_status: optional_status,
          optional_nullable_status: optional_nullable_status,
          nullable_notification: nullable_notification,
          optional_notification: optional_notification,
          optional_nullable_notification: optional_nullable_notification,
          nullable_search_result: nullable_search_result,
          optional_search_result: optional_search_result,
          nullable_array: nullable_array,
          optional_array: optional_array,
          optional_nullable_array: optional_nullable_array,
          nullable_list_of_nullables: nullable_list_of_nullables,
          nullable_map_of_nullables: nullable_map_of_nullables,
          nullable_list_of_unions: nullable_list_of_unions,
          optional_map_of_enums: optional_map_of_enums,
          additional_properties: struct
        )
      end

      # Serialize an instance of ComplexProfile to a JSON object
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
        obj.nullable_role&.is_a?(SeedNullableOptionalClient::NullableOptional::UserRole) != false || raise("Passed value for field obj.nullable_role is not the expected type, validation failed.")
        obj.optional_role&.is_a?(SeedNullableOptionalClient::NullableOptional::UserRole) != false || raise("Passed value for field obj.optional_role is not the expected type, validation failed.")
        obj.optional_nullable_role&.is_a?(SeedNullableOptionalClient::NullableOptional::UserRole) != false || raise("Passed value for field obj.optional_nullable_role is not the expected type, validation failed.")
        obj.nullable_status&.is_a?(SeedNullableOptionalClient::NullableOptional::UserStatus) != false || raise("Passed value for field obj.nullable_status is not the expected type, validation failed.")
        obj.optional_status&.is_a?(SeedNullableOptionalClient::NullableOptional::UserStatus) != false || raise("Passed value for field obj.optional_status is not the expected type, validation failed.")
        obj.optional_nullable_status&.is_a?(SeedNullableOptionalClient::NullableOptional::UserStatus) != false || raise("Passed value for field obj.optional_nullable_status is not the expected type, validation failed.")
        obj.nullable_notification.nil? || SeedNullableOptionalClient::NullableOptional::NotificationMethod.validate_raw(obj: obj.nullable_notification)
        obj.optional_notification.nil? || SeedNullableOptionalClient::NullableOptional::NotificationMethod.validate_raw(obj: obj.optional_notification)
        obj.optional_nullable_notification.nil? || SeedNullableOptionalClient::NullableOptional::NotificationMethod.validate_raw(obj: obj.optional_nullable_notification)
        obj.nullable_search_result.nil? || SeedNullableOptionalClient::NullableOptional::SearchResult.validate_raw(obj: obj.nullable_search_result)
        obj.optional_search_result.nil? || SeedNullableOptionalClient::NullableOptional::SearchResult.validate_raw(obj: obj.optional_search_result)
        obj.nullable_array&.is_a?(Array) != false || raise("Passed value for field obj.nullable_array is not the expected type, validation failed.")
        obj.optional_array&.is_a?(Array) != false || raise("Passed value for field obj.optional_array is not the expected type, validation failed.")
        obj.optional_nullable_array&.is_a?(Array) != false || raise("Passed value for field obj.optional_nullable_array is not the expected type, validation failed.")
        obj.nullable_list_of_nullables&.is_a?(Array) != false || raise("Passed value for field obj.nullable_list_of_nullables is not the expected type, validation failed.")
        obj.nullable_map_of_nullables&.is_a?(Hash) != false || raise("Passed value for field obj.nullable_map_of_nullables is not the expected type, validation failed.")
        obj.nullable_list_of_unions&.is_a?(Array) != false || raise("Passed value for field obj.nullable_list_of_unions is not the expected type, validation failed.")
        obj.optional_map_of_enums&.is_a?(Hash) != false || raise("Passed value for field obj.optional_map_of_enums is not the expected type, validation failed.")
      end
    end
  end
end
