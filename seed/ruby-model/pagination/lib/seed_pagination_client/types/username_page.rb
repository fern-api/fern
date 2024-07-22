# frozen_string_literal: true

require "ostruct"
require "json"

module SeedPaginationClient
  class UsernamePage
    # @return [String]
    attr_reader :after
    # @return [Array<String>]
    attr_reader :data
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param after [String]
    # @param data [Array<String>]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedPaginationClient::UsernamePage]
    def initialize(data:, after: OMIT, additional_properties: nil)
      @after = after if after != OMIT
      @data = data
      @additional_properties = additional_properties
      @_field_set = { "after": after, "data": data }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of UsernamePage
    #
    # @param json_object [String]
    # @return [SeedPaginationClient::UsernamePage]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      after = parsed_json["after"]
      data = parsed_json["data"]
      new(
        after: after,
        data: data,
        additional_properties: struct
      )
    end

    # Serialize an instance of UsernamePage to a JSON object
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
      obj.after&.is_a?(String) != false || raise("Passed value for field obj.after is not the expected type, validation failed.")
      obj.data.is_a?(Array) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
    end
  end
end
