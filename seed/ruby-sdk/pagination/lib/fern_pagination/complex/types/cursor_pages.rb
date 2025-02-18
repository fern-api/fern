# frozen_string_literal: true

require_relative "starting_after_paging"
require "ostruct"
require "json"

module SeedPaginationClient
  class Complex
    class CursorPages
      # @return [SeedPaginationClient::Complex::StartingAfterPaging]
      attr_reader :next_
      # @return [Integer]
      attr_reader :page
      # @return [Integer]
      attr_reader :per_page
      # @return [Integer]
      attr_reader :total_pages
      # @return [String]
      attr_reader :type
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param next_ [SeedPaginationClient::Complex::StartingAfterPaging]
      # @param page [Integer]
      # @param per_page [Integer]
      # @param total_pages [Integer]
      # @param type [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Complex::CursorPages]
      def initialize(type:, next_: OMIT, page: OMIT, per_page: OMIT, total_pages: OMIT, additional_properties: nil)
        @next_ = next_ if next_ != OMIT
        @page = page if page != OMIT
        @per_page = per_page if per_page != OMIT
        @total_pages = total_pages if total_pages != OMIT
        @type = type
        @additional_properties = additional_properties
        @_field_set = {
          "next": next_,
          "page": page,
          "per_page": per_page,
          "total_pages": total_pages,
          "type": type
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of CursorPages
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::CursorPages]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["next"].nil?
          next_ = nil
        else
          next_ = parsed_json["next"].to_json
          next_ = SeedPaginationClient::Complex::StartingAfterPaging.from_json(json_object: next_)
        end
        page = parsed_json["page"]
        per_page = parsed_json["per_page"]
        total_pages = parsed_json["total_pages"]
        type = parsed_json["type"]
        new(
          next_: next_,
          page: page,
          per_page: per_page,
          total_pages: total_pages,
          type: type,
          additional_properties: struct
        )
      end

      # Serialize an instance of CursorPages to a JSON object
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
        obj.next_.nil? || SeedPaginationClient::Complex::StartingAfterPaging.validate_raw(obj: obj.next_)
        obj.page&.is_a?(Integer) != false || raise("Passed value for field obj.page is not the expected type, validation failed.")
        obj.per_page&.is_a?(Integer) != false || raise("Passed value for field obj.per_page is not the expected type, validation failed.")
        obj.total_pages&.is_a?(Integer) != false || raise("Passed value for field obj.total_pages is not the expected type, validation failed.")
        obj.type.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
      end
    end
  end
end
