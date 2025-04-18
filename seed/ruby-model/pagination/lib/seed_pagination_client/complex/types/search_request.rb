# frozen_string_literal: true

require_relative "starting_after_paging"
require_relative "search_request_query"
require "ostruct"
require "json"

module SeedPaginationClient
  class Complex
    class SearchRequest
      # @return [SeedPaginationClient::Complex::StartingAfterPaging]
      attr_reader :pagination
      # @return [SeedPaginationClient::Complex::SearchRequestQuery]
      attr_reader :query
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param pagination [SeedPaginationClient::Complex::StartingAfterPaging]
      # @param query [SeedPaginationClient::Complex::SearchRequestQuery]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Complex::SearchRequest]
      def initialize(query:, pagination: OMIT, additional_properties: nil)
        @pagination = pagination if pagination != OMIT
        @query = query
        @additional_properties = additional_properties
        @_field_set = { "pagination": pagination, "query": query }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SearchRequest
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::SearchRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["pagination"].nil?
          pagination = nil
        else
          pagination = parsed_json["pagination"].to_json
          pagination = SeedPaginationClient::Complex::StartingAfterPaging.from_json(json_object: pagination)
        end
        if parsed_json["query"].nil?
          query = nil
        else
          query = parsed_json["query"].to_json
          query = SeedPaginationClient::Complex::SearchRequestQuery.from_json(json_object: query)
        end
        new(
          pagination: pagination,
          query: query,
          additional_properties: struct
        )
      end

      # Serialize an instance of SearchRequest to a JSON object
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
        obj.pagination.nil? || SeedPaginationClient::Complex::StartingAfterPaging.validate_raw(obj: obj.pagination)
        SeedPaginationClient::Complex::SearchRequestQuery.validate_raw(obj: obj.query)
      end
    end
  end
end
