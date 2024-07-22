# frozen_string_literal: true

require "ostruct"
require "json"

module SeedPaginationClient
  class Users
    class WithPage
      # @return [Integer]
      attr_reader :page
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param page [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Users::WithPage]
      def initialize(page: OMIT, additional_properties: nil)
        @page = page if page != OMIT
        @additional_properties = additional_properties
        @_field_set = { "page": page }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of WithPage
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Users::WithPage]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        page = parsed_json["page"]
        new(page: page, additional_properties: struct)
      end

      # Serialize an instance of WithPage to a JSON object
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
        obj.page&.is_a?(Integer) != false || raise("Passed value for field obj.page is not the expected type, validation failed.")
      end
    end
  end
end
