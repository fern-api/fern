# frozen_string_literal: true

require_relative "next_page"
require "ostruct"
require "json"

module SeedPaginationClient
  class Users
    class Page
      # @return [Integer] The current page
      attr_reader :page
      # @return [SeedPaginationClient::Users::NextPage]
      attr_reader :next_
      # @return [Integer]
      attr_reader :per_page
      # @return [Integer]
      attr_reader :total_page
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param page [Integer] The current page
      # @param next_ [SeedPaginationClient::Users::NextPage]
      # @param per_page [Integer]
      # @param total_page [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Users::Page]
      def initialize(page:, per_page:, total_page:, next_: OMIT, additional_properties: nil)
        @page = page
        @next_ = next_ if next_ != OMIT
        @per_page = per_page
        @total_page = total_page
        @additional_properties = additional_properties
        @_field_set = {
          "page": page,
          "next": next_,
          "per_page": per_page,
          "total_page": total_page
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Page
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Users::Page]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        page = parsed_json["page"]
        if parsed_json["next"].nil?
          next_ = nil
        else
          next_ = parsed_json["next"].to_json
          next_ = SeedPaginationClient::Users::NextPage.from_json(json_object: next_)
        end
        per_page = parsed_json["per_page"]
        total_page = parsed_json["total_page"]
        new(
          page: page,
          next_: next_,
          per_page: per_page,
          total_page: total_page,
          additional_properties: struct
        )
      end

      # Serialize an instance of Page to a JSON object
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
        obj.page.is_a?(Integer) != false || raise("Passed value for field obj.page is not the expected type, validation failed.")
        obj.next_.nil? || SeedPaginationClient::Users::NextPage.validate_raw(obj: obj.next_)
        obj.per_page.is_a?(Integer) != false || raise("Passed value for field obj.per_page is not the expected type, validation failed.")
        obj.total_page.is_a?(Integer) != false || raise("Passed value for field obj.total_page is not the expected type, validation failed.")
      end
    end
  end
end
