# frozen_string_literal: true

require_relative "page"
require_relative "user"
require "json"

module SeedPaginationClient
  class Users
    class ListUsersPaginationResponse
      attr_reader :page, :total_count, :data, :additional_properties

      # @param page [Users::Page]
      # @param total_count [Integer] The totall number of /users
      # @param data [Array<Users::User>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Users::ListUsersPaginationResponse]
      def initialize(total_count:, data:, page: nil, additional_properties: nil)
        # @type [Users::Page]
        @page = page
        # @type [Integer] The totall number of /users
        @total_count = total_count
        # @type [Array<Users::User>]
        @data = data
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ListUsersPaginationResponse
      #
      # @param json_object [JSON]
      # @return [Users::ListUsersPaginationResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["page"].nil?
          page = nil
        else
          page = parsed_json["page"].to_json
          page = Users::Page.from_json(json_object: page)
        end
        total_count = struct.total_count
        data = parsed_json["data"]&.map do |v|
          v = v.to_json
          Users::User.from_json(json_object: v)
        end
        new(page: page, total_count: total_count, data: data, additional_properties: struct)
      end

      # Serialize an instance of ListUsersPaginationResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "page": @page, "total_count": @total_count, "data": @data }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.page.nil? || Users::Page.validate_raw(obj: obj.page)
        obj.total_count.is_a?(Integer) != false || raise("Passed value for field obj.total_count is not the expected type, validation failed.")
        obj.data.is_a?(Array) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
      end
    end
  end
end
