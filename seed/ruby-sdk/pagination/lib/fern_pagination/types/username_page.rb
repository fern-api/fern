# frozen_string_literal: true

require "json"

module SeedPaginationClient
  class UsernamePage
    attr_reader :after, :data, :additional_properties

    # @param after [String]
    # @param data [Array<String>]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [UsernamePage]
    def initialize(data:, after: nil, additional_properties: nil)
      # @type [String]
      @after = after
      # @type [Array<String>]
      @data = data
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of UsernamePage
    #
    # @param json_object [JSON]
    # @return [UsernamePage]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      JSON.parse(json_object)
      after = struct.after
      data = struct.data
      new(after: after, data: data, additional_properties: struct)
    end

    # Serialize an instance of UsernamePage to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { "after": @after, "data": @data }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.after&.is_a?(String) != false || raise("Passed value for field obj.after is not the expected type, validation failed.")
      obj.data.is_a?(Array) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
    end
  end
end
