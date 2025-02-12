# frozen_string_literal: true

require "ostruct"
require "json"

module SeedPaginationClient
  class Complex
    class StartingAfterPaging
      # @return [Integer]
      attr_reader :per_page
      # @return [String]
      attr_reader :starting_after
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param per_page [Integer]
      # @param starting_after [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Complex::StartingAfterPaging]
      def initialize(per_page:, starting_after: OMIT, additional_properties: nil)
        @per_page = per_page
        @starting_after = starting_after if starting_after != OMIT
        @additional_properties = additional_properties
        @_field_set = { "per_page": per_page, "starting_after": starting_after }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of StartingAfterPaging
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::StartingAfterPaging]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        per_page = parsed_json["per_page"]
        starting_after = parsed_json["starting_after"]
        new(
          per_page: per_page,
          starting_after: starting_after,
          additional_properties: struct
        )
      end

      # Serialize an instance of StartingAfterPaging to a JSON object
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
        obj.per_page.is_a?(Integer) != false || raise("Passed value for field obj.per_page is not the expected type, validation failed.")
        obj.starting_after&.is_a?(String) != false || raise("Passed value for field obj.starting_after is not the expected type, validation failed.")
      end
    end
  end
end
