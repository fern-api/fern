# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class RootType
    attr_reader :s, :additional_properties, :_field_set
    protected :_field_set
    OMIT = Object.new
    # @param s [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::RootType]
    def initialize(s:, additional_properties: nil)
      # @type [String]
      @s = s
      @_field_set = { "s": @s }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of RootType
    #
    # @param json_object [String]
    # @return [SeedApiClient::RootType]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      s = struct["s"]
      new(s: s, additional_properties: struct)
    end

    # Serialize an instance of RootType to a JSON object
    #
    # @return [String]
    def to_json(*_args)
      @_field_set&.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.s.is_a?(String) != false || raise("Passed value for field obj.s is not the expected type, validation failed.")
    end
  end
end
