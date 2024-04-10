# frozen_string_literal: true

require_relative "../a/types/a"
require "ostruct"
require "json"

module SeedApiClient
  class ImportingA
    # @return [SeedApiClient::A::A]
    attr_reader :a
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param a [SeedApiClient::A::A]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::ImportingA]
    def initialize(a: OMIT, additional_properties: nil)
      @a = a if a != OMIT
      @additional_properties = additional_properties
      @_field_set = { "a": a }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of ImportingA
    #
    # @param json_object [String]
    # @return [SeedApiClient::ImportingA]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      if parsed_json["a"].nil?
        a = nil
      else
        a = parsed_json["a"].to_json
        a = SeedApiClient::A::A.from_json(json_object: a)
      end
      new(a: a, additional_properties: struct)
    end

    # Serialize an instance of ImportingA to a JSON object
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
      obj.a.nil? || SeedApiClient::A::A.validate_raw(obj: obj.a)
    end
  end
end
