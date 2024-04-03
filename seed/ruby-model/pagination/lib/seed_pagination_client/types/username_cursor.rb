# frozen_string_literal: true

require_relative "username_page"
require "json"

module SeedPaginationClient
  class UsernameCursor
    attr_reader :cursor, :additional_properties

    # @param cursor [UsernamePage]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [UsernameCursor]
    def initialize(cursor:, additional_properties: nil)
      # @type [UsernamePage]
      @cursor = cursor
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of UsernameCursor
    #
    # @param json_object [JSON]
    # @return [UsernameCursor]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      if parsed_json["cursor"].nil?
        cursor = nil
      else
        cursor = parsed_json["cursor"].to_json
        cursor = UsernamePage.from_json(json_object: cursor)
      end
      new(cursor: cursor, additional_properties: struct)
    end

    # Serialize an instance of UsernameCursor to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { "cursor": @cursor }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      UsernamePage.validate_raw(obj: obj.cursor)
    end
  end
end
