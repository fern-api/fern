# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class TypeWithSingleCharPropertyEqualToTypeStartingLetter
    # @return [String]
    attr_reader :t
    # @return [String]
    attr_reader :ty
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param t [String]
    # @param ty [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedExamplesClient::TypeWithSingleCharPropertyEqualToTypeStartingLetter]
    def initialize(t:, ty:, additional_properties: nil)
      @t = t
      @ty = ty
      @additional_properties = additional_properties
      @_field_set = { "t": t, "ty": ty }
    end

    # Deserialize a JSON object to an instance of
    #  TypeWithSingleCharPropertyEqualToTypeStartingLetter
    #
    # @param json_object [String]
    # @return [SeedExamplesClient::TypeWithSingleCharPropertyEqualToTypeStartingLetter]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      t = parsed_json["t"]
      ty = parsed_json["ty"]
      new(
        t: t,
        ty: ty,
        additional_properties: struct
      )
    end

    # Serialize an instance of TypeWithSingleCharPropertyEqualToTypeStartingLetter to
    #  a JSON object
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
      obj.t.is_a?(String) != false || raise("Passed value for field obj.t is not the expected type, validation failed.")
      obj.ty.is_a?(String) != false || raise("Passed value for field obj.ty is not the expected type, validation failed.")
    end
  end
end
