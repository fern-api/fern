# frozen_string_literal: true

require_relative "next_page"
require "json"

module SeedPaginationClient
  class Users
    class Page
      attr_reader :page, :next_, :per_page, :total_page, :additional_properties

      # @param page [Integer] The current page
      # @param next_ [Users::NextPage]
      # @param per_page [Integer]
      # @param total_page [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Users::Page]
      def initialize(page:, per_page:, total_page:, next_: nil, additional_properties: nil)
        # @type [Integer] The current page
        @page = page
        # @type [Users::NextPage]
        @next_ = next_
        # @type [Integer]
        @per_page = per_page
        # @type [Integer]
        @total_page = total_page
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Page
      #
      # @param json_object [JSON]
      # @return [Users::Page]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        page = struct.page
        if parsed_json["next"].nil?
          next_ = nil
        else
          next_ = parsed_json["next"].to_json
          next_ = Users::NextPage.from_json(json_object: next_)
        end
        per_page = struct.per_page
        total_page = struct.total_page
        new(page: page, next_: next_, per_page: per_page, total_page: total_page, additional_properties: struct)
      end

      # Serialize an instance of Page to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "page": @page, "next": @next_, "per_page": @per_page, "total_page": @total_page }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.page.is_a?(Integer) != false || raise("Passed value for field obj.page is not the expected type, validation failed.")
        obj.next_.nil? || Users::NextPage.validate_raw(obj: obj.next_)
        obj.per_page.is_a?(Integer) != false || raise("Passed value for field obj.per_page is not the expected type, validation failed.")
        obj.total_page.is_a?(Integer) != false || raise("Passed value for field obj.total_page is not the expected type, validation failed.")
      end
    end
  end
end
