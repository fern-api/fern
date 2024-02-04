# frozen_string_literal: true

require_relative "../a/types/a"
require "json"

module SeedApiClient
  class ImportingA
    attr_reader :a, :additional_properties

    # @param a [A::A]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [ImportingA]
    def initialize(a: nil, additional_properties: nil)
      # @type [A::A]
      @a = a
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of ImportingA
    #
    # @param json_object [JSON]
    # @return [ImportingA]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      a = struct.a
      new(a: a, additional_properties: struct)
    end

    # Serialize an instance of ImportingA to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { "a": @a }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.a.nil? || A::A.validate_raw(obj: obj.a)
    end
  end
end
