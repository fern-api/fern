# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedPaginationClient
  class Users
    class ListUsersTopLevelCursorPaginationResponse
      # @return [String]
      attr_reader :next_cursor
      # @return [Array<SeedPaginationClient::Users::User>]
      attr_reader :data
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param next_cursor [String]
      # @param data [Array<SeedPaginationClient::Users::User>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Users::ListUsersTopLevelCursorPaginationResponse]
      def initialize(data:, next_cursor: OMIT, additional_properties: nil)
        @next_cursor = next_cursor if next_cursor != OMIT
        @data = data
        @additional_properties = additional_properties
        @_field_set = { "next_cursor": next_cursor, "data": data }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of
      #  ListUsersTopLevelCursorPaginationResponse
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Users::ListUsersTopLevelCursorPaginationResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        next_cursor = parsed_json["next_cursor"]
        data = parsed_json["data"]&.map do |item|
          item = item.to_json
          SeedPaginationClient::Users::User.from_json(json_object: item)
        end
        new(
          next_cursor: next_cursor,
          data: data,
          additional_properties: struct
        )
      end

      # Serialize an instance of ListUsersTopLevelCursorPaginationResponse to a JSON
      #  object
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
        obj.next_cursor&.is_a?(String) != false || raise("Passed value for field obj.next_cursor is not the expected type, validation failed.")
        obj.data.is_a?(Array) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
      end
    end
  end
end
