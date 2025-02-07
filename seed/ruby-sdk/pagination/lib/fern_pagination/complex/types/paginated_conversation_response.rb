# frozen_string_literal: true

require_relative "conversation"
require_relative "cursor_pages"
require "ostruct"
require "json"

module SeedPaginationClient
  class Complex
    class PaginatedConversationResponse
      # @return [Array<SeedPaginationClient::Complex::Conversation>]
      attr_reader :conversations
      # @return [SeedPaginationClient::Complex::CursorPages]
      attr_reader :pages
      # @return [Integer]
      attr_reader :total_count
      # @return [String]
      attr_reader :type
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param conversations [Array<SeedPaginationClient::Complex::Conversation>]
      # @param pages [SeedPaginationClient::Complex::CursorPages]
      # @param total_count [Integer]
      # @param type [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Complex::PaginatedConversationResponse]
      def initialize(conversations:, total_count:, type:, pages: OMIT, additional_properties: nil)
        @conversations = conversations
        @pages = pages if pages != OMIT
        @total_count = total_count
        @type = type
        @additional_properties = additional_properties
        @_field_set = {
          "conversations": conversations,
          "pages": pages,
          "total_count": total_count,
          "type": type
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of PaginatedConversationResponse
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::PaginatedConversationResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        conversations = parsed_json["conversations"]&.map do |item|
          item = item.to_json
          SeedPaginationClient::Complex::Conversation.from_json(json_object: item)
        end
        if parsed_json["pages"].nil?
          pages = nil
        else
          pages = parsed_json["pages"].to_json
          pages = SeedPaginationClient::Complex::CursorPages.from_json(json_object: pages)
        end
        total_count = parsed_json["total_count"]
        type = parsed_json["type"]
        new(
          conversations: conversations,
          pages: pages,
          total_count: total_count,
          type: type,
          additional_properties: struct
        )
      end

      # Serialize an instance of PaginatedConversationResponse to a JSON object
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
        obj.conversations.is_a?(Array) != false || raise("Passed value for field obj.conversations is not the expected type, validation failed.")
        obj.pages.nil? || SeedPaginationClient::Complex::CursorPages.validate_raw(obj: obj.pages)
        obj.total_count.is_a?(Integer) != false || raise("Passed value for field obj.total_count is not the expected type, validation failed.")
        obj.type.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
      end
    end
  end
end
