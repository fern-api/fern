# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    # Response with pagination info like Auth0
    class PaginatedUserResponse
      # @return [Array<SeedClientSideParamsClient::Types::User>]
      attr_reader :users
      # @return [Integer]
      attr_reader :start
      # @return [Integer]
      attr_reader :limit
      # @return [Integer]
      attr_reader :length
      # @return [Integer]
      attr_reader :total
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param users [Array<SeedClientSideParamsClient::Types::User>]
      # @param start [Integer]
      # @param limit [Integer]
      # @param length [Integer]
      # @param total [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::PaginatedUserResponse]
      def initialize(users:, start:, limit:, length:, total: OMIT, additional_properties: nil)
        @users = users
        @start = start
        @limit = limit
        @length = length
        @total = total if total != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "users": users,
          "start": start,
          "limit": limit,
          "length": length,
          "total": total
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of PaginatedUserResponse
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::PaginatedUserResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        users = parsed_json["users"]&.map do |item|
          item = item.to_json
          SeedClientSideParamsClient::Types::User.from_json(json_object: item)
        end
        start = parsed_json["start"]
        limit = parsed_json["limit"]
        length = parsed_json["length"]
        total = parsed_json["total"]
        new(
          users: users,
          start: start,
          limit: limit,
          length: length,
          total: total,
          additional_properties: struct
        )
      end

      # Serialize an instance of PaginatedUserResponse to a JSON object
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
        obj.users.is_a?(Array) != false || raise("Passed value for field obj.users is not the expected type, validation failed.")
        obj.start.is_a?(Integer) != false || raise("Passed value for field obj.start is not the expected type, validation failed.")
        obj.limit.is_a?(Integer) != false || raise("Passed value for field obj.limit is not the expected type, validation failed.")
        obj.length.is_a?(Integer) != false || raise("Passed value for field obj.length is not the expected type, validation failed.")
        obj.total&.is_a?(Integer) != false || raise("Passed value for field obj.total is not the expected type, validation failed.")
      end
    end
  end
end
