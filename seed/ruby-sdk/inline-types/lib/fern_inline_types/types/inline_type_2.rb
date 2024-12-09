# frozen_string_literal: true

require "ostruct"
require "json"

module SeedObjectClient
  class InlineType2
    # @return [String]
    attr_reader :baz
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param baz [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedObjectClient::InlineType2]
    def initialize(baz:, additional_properties: nil)
      @baz = baz
      @additional_properties = additional_properties
      @_field_set = { "baz": baz }
    end

    # Deserialize a JSON object to an instance of InlineType2
    #
    # @param json_object [String]
    # @return [SeedObjectClient::InlineType2]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      baz = parsed_json["baz"]
      new(baz: baz, additional_properties: struct)
    end

    # Serialize an instance of InlineType2 to a JSON object
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
      obj.baz.is_a?(String) != false || raise("Passed value for field obj.baz is not the expected type, validation failed.")
    end
  end
end
