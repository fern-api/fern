# frozen_string_literal: true

require "json"
require_relative "single_filter_search_request"
require_relative "multiple_filter_search_request"

module SeedPaginationClient
  class Complex
    class SearchRequestQuery
      # Deserialize a JSON object to an instance of SearchRequestQuery
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::SearchRequestQuery]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          SeedPaginationClient::Complex::SingleFilterSearchRequest.validate_raw(obj: struct)
          unless struct.nil?
            return SeedPaginationClient::Complex::SingleFilterSearchRequest.from_json(json_object: struct)
          end

          return nil
        rescue StandardError
          # noop
        end
        begin
          SeedPaginationClient::Complex::MultipleFilterSearchRequest.validate_raw(obj: struct)
          unless struct.nil?
            return SeedPaginationClient::Complex::MultipleFilterSearchRequest.from_json(json_object: struct)
          end

          return nil
        rescue StandardError
          # noop
        end
        struct
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        begin
          return SeedPaginationClient::Complex::SingleFilterSearchRequest.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return SeedPaginationClient::Complex::MultipleFilterSearchRequest.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
