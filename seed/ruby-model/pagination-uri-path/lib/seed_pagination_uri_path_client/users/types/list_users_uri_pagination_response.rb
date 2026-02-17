# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedPaginationUriPathClient
  class Users
    class ListUsersUriPaginationResponse
      # @return [Array<SeedPaginationUriPathClient::Users::User>]
      attr_reader :data
      # @return [String]
      attr_reader :next_
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param data [Array<SeedPaginationUriPathClient::Users::User>]
      # @param next_ [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationUriPathClient::Users::ListUsersUriPaginationResponse]
      def initialize(data:, next_: OMIT, additional_properties: nil)
        @data = data
        @next_ = next_ if next_ != OMIT
        @additional_properties = additional_properties
        @_field_set = { "data": data, "next": next_ }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of ListUsersUriPaginationResponse
      #
      # @param json_object [String]
      # @return [SeedPaginationUriPathClient::Users::ListUsersUriPaginationResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        data = parsed_json["data"]&.map do |item|
          item = item.to_json
          SeedPaginationUriPathClient::Users::User.from_json(json_object: item)
        end
        next_ = parsed_json["next"]
        new(
          data: data,
          next_: next_,
          additional_properties: struct
        )
      end

      # Serialize an instance of ListUsersUriPaginationResponse to a JSON object
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
        obj.data.is_a?(Array) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
        obj.next_&.is_a?(String) != false || raise("Passed value for field obj.next_ is not the expected type, validation failed.")
      end
    end
  end
end
