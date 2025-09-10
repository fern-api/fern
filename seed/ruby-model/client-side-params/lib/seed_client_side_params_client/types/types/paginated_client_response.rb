# frozen_string_literal: true

require_relative "client"
require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    # Paginated response for clients listing
    class PaginatedClientResponse
      # @return [Integer] Starting index (zero-based)
      attr_reader :start
      # @return [Integer] Number of items requested
      attr_reader :limit
      # @return [Integer] Number of items returned
      attr_reader :length
      # @return [Integer] Total number of items (when include_totals=true)
      attr_reader :total
      # @return [Array<SeedClientSideParamsClient::Types::Client>] List of clients
      attr_reader :clients
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param start [Integer] Starting index (zero-based)
      # @param limit [Integer] Number of items requested
      # @param length [Integer] Number of items returned
      # @param total [Integer] Total number of items (when include_totals=true)
      # @param clients [Array<SeedClientSideParamsClient::Types::Client>] List of clients
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::PaginatedClientResponse]
      def initialize(start:, limit:, length:, clients:, total: OMIT, additional_properties: nil)
        @start = start
        @limit = limit
        @length = length
        @total = total if total != OMIT
        @clients = clients
        @additional_properties = additional_properties
        @_field_set = {
          "start": start,
          "limit": limit,
          "length": length,
          "total": total,
          "clients": clients
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of PaginatedClientResponse
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::PaginatedClientResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        start = parsed_json["start"]
        limit = parsed_json["limit"]
        length = parsed_json["length"]
        total = parsed_json["total"]
        clients = parsed_json["clients"]&.map do |item|
          item = item.to_json
          SeedClientSideParamsClient::Types::Client.from_json(json_object: item)
        end
        new(
          start: start,
          limit: limit,
          length: length,
          total: total,
          clients: clients,
          additional_properties: struct
        )
      end

      # Serialize an instance of PaginatedClientResponse to a JSON object
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
        obj.start.is_a?(Integer) != false || raise("Passed value for field obj.start is not the expected type, validation failed.")
        obj.limit.is_a?(Integer) != false || raise("Passed value for field obj.limit is not the expected type, validation failed.")
        obj.length.is_a?(Integer) != false || raise("Passed value for field obj.length is not the expected type, validation failed.")
        obj.total&.is_a?(Integer) != false || raise("Passed value for field obj.total is not the expected type, validation failed.")
        obj.clients.is_a?(Array) != false || raise("Passed value for field obj.clients is not the expected type, validation failed.")
      end
    end
  end
end
