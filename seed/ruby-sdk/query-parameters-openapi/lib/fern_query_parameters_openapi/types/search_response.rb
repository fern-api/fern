# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class SearchResponse
    # @return [Array<String>]
    attr_reader :results
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param results [Array<String>]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::SearchResponse]
    def initialize(results: OMIT, additional_properties: nil)
      @results = results if results != OMIT
      @additional_properties = additional_properties
      @_field_set = { "results": results }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of SearchResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::SearchResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      results = parsed_json["results"]
      new(results: results, additional_properties: struct)
    end

    # Serialize an instance of SearchResponse to a JSON object
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
      obj.results&.is_a?(Array) != false || raise("Passed value for field obj.results is not the expected type, validation failed.")
    end
  end
end
