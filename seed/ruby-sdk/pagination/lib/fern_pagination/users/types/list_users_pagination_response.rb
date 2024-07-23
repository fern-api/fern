# frozen_string_literal: true

require_relative "page"
require_relative "user"
require "ostruct"
require "json"

module SeedPaginationClient
  class Users
    class ListUsersPaginationResponse
      # @return [SeedPaginationClient::Users::Page]
      attr_reader :page
      # @return [Integer] The totall number of /users
      attr_reader :total_count
      # @return [Array<SeedPaginationClient::Users::User>]
      attr_reader :data
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param page [SeedPaginationClient::Users::Page]
      # @param total_count [Integer] The totall number of /users
      # @param data [Array<SeedPaginationClient::Users::User>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
      def initialize(total_count:, data:, page: OMIT, additional_properties: nil)
        @page = page if page != OMIT
        @total_count = total_count
        @data = data
        @additional_properties = additional_properties
        @_field_set = { "page": page, "total_count": total_count, "data": data }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of ListUsersPaginationResponse
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Users::ListUsersPaginationResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["page"].nil?
          page = nil
        else
          page = parsed_json["page"].to_json
          page = SeedPaginationClient::Users::Page.from_json(json_object: page)
        end
        total_count = parsed_json["total_count"]
        data = parsed_json["data"]&.map do |item|
          item = item.to_json
          SeedPaginationClient::Users::User.from_json(json_object: item)
        end
        new(
          page: page,
          total_count: total_count,
          data: data,
          additional_properties: struct
        )
      end

      # Serialize an instance of ListUsersPaginationResponse to a JSON object
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
        obj.page.nil? || SeedPaginationClient::Users::Page.validate_raw(obj: obj.page)
        obj.total_count.is_a?(Integer) != false || raise("Passed value for field obj.total_count is not the expected type, validation failed.")
        obj.data.is_a?(Array) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
      end
    end
  end
end
