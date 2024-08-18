# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class NamespaceSummary
    # @return [Integer]
    attr_reader :count
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param count [Integer]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::NamespaceSummary]
    def initialize(count: OMIT, additional_properties: nil)
      @count = count if count != OMIT
      @additional_properties = additional_properties
      @_field_set = { "count": count }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of NamespaceSummary
    #
    # @param json_object [String]
    # @return [SeedApiClient::NamespaceSummary]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      count = parsed_json["count"]
      new(count: count, additional_properties: struct)
    end

    # Serialize an instance of NamespaceSummary to a JSON object
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
      obj.count&.is_a?(Integer) != false || raise("Passed value for field obj.count is not the expected type, validation failed.")
    end
  end
end
