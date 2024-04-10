# frozen_string_literal: true

require_relative "username_page"
require "ostruct"
require "json"

module SeedPaginationClient
  class UsernameCursor
    # @return [SeedPaginationClient::UsernamePage]
    attr_reader :cursor
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param cursor [SeedPaginationClient::UsernamePage]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedPaginationClient::UsernameCursor]
    def initialize(cursor:, additional_properties: nil)
      @cursor = cursor
      @additional_properties = additional_properties
      @_field_set = { "cursor": cursor }
    end

    # Deserialize a JSON object to an instance of UsernameCursor
    #
    # @param json_object [String]
    # @return [SeedPaginationClient::UsernameCursor]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      if parsed_json["cursor"].nil?
        cursor = nil
      else
        cursor = parsed_json["cursor"].to_json
        cursor = SeedPaginationClient::UsernamePage.from_json(json_object: cursor)
      end
      new(cursor: cursor, additional_properties: struct)
    end

    # Serialize an instance of UsernameCursor to a JSON object
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
      SeedPaginationClient::UsernamePage.validate_raw(obj: obj.cursor)
    end
  end
end
