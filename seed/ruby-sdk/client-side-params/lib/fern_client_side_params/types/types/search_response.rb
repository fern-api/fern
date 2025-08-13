# frozen_string_literal: true

require_relative "resource"
require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    class SearchResponse
      # @return [Array<SeedClientSideParamsClient::Types::Resource>]
      attr_reader :results
      # @return [Integer]
      attr_reader :total
      # @return [Integer]
      attr_reader :next_offset
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param results [Array<SeedClientSideParamsClient::Types::Resource>]
      # @param total [Integer]
      # @param next_offset [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::SearchResponse]
      def initialize(results:, total: OMIT, next_offset: OMIT, additional_properties: nil)
        @results = results
        @total = total if total != OMIT
        @next_offset = next_offset if next_offset != OMIT
        @additional_properties = additional_properties
        @_field_set = { "results": results, "total": total, "next_offset": next_offset }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SearchResponse
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::SearchResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        results = parsed_json["results"]&.map do |item|
          item = item.to_json
          SeedClientSideParamsClient::Types::Resource.from_json(json_object: item)
        end
        total = parsed_json["total"]
        next_offset = parsed_json["next_offset"]
        new(
          results: results,
          total: total,
          next_offset: next_offset,
          additional_properties: struct
        )
      end

      # Serialize an instance of SearchResponse to a JSON object
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
        obj.results.is_a?(Array) != false || raise("Passed value for field obj.results is not the expected type, validation failed.")
        obj.total&.is_a?(Integer) != false || raise("Passed value for field obj.total is not the expected type, validation failed.")
        obj.next_offset&.is_a?(Integer) != false || raise("Passed value for field obj.next_offset is not the expected type, validation failed.")
      end
    end
  end
end
