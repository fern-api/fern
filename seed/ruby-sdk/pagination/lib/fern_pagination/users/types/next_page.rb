# frozen_string_literal: true

require "json"

module SeedPaginationClient
  class Users
    class NextPage
      attr_reader :page, :starting_after, :additional_properties

      # @param page [Integer]
      # @param starting_after [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Users::NextPage]
      def initialize(page:, starting_after:, additional_properties: nil)
        # @type [Integer]
        @page = page
        # @type [String]
        @starting_after = starting_after
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of NextPage
      #
      # @param json_object [JSON]
      # @return [Users::NextPage]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        page = struct.page
        starting_after = struct.starting_after
        new(page: page, starting_after: starting_after, additional_properties: struct)
      end

      # Serialize an instance of NextPage to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "page": @page, "starting_after": @starting_after }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.page.is_a?(Integer) != false || raise("Passed value for field obj.page is not the expected type, validation failed.")
        obj.starting_after.is_a?(String) != false || raise("Passed value for field obj.starting_after is not the expected type, validation failed.")
      end
    end
  end
end
