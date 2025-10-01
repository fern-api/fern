# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class Foo
    # @return [String]
    attr_reader :bar
    # @return [String]
    attr_reader :nullable_bar
    # @return [String]
    attr_reader :nullable_required_bar
    # @return [String]
    attr_reader :required_bar
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param bar [String]
    # @param nullable_bar [String]
    # @param nullable_required_bar [String]
    # @param required_bar [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::Foo]
    def initialize(required_bar:, bar: OMIT, nullable_bar: OMIT, nullable_required_bar: OMIT,
                   additional_properties: nil)
      @bar = bar if bar != OMIT
      @nullable_bar = nullable_bar if nullable_bar != OMIT
      @nullable_required_bar = nullable_required_bar if nullable_required_bar != OMIT
      @required_bar = required_bar
      @additional_properties = additional_properties
      @_field_set = {
        "bar": bar,
        "nullable_bar": nullable_bar,
        "nullable_required_bar": nullable_required_bar,
        "required_bar": required_bar
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of Foo
    #
    # @param json_object [String]
    # @return [SeedApiClient::Foo]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      bar = parsed_json["bar"]
      nullable_bar = parsed_json["nullable_bar"]
      nullable_required_bar = parsed_json["nullable_required_bar"]
      required_bar = parsed_json["required_bar"]
      new(
        bar: bar,
        nullable_bar: nullable_bar,
        nullable_required_bar: nullable_required_bar,
        required_bar: required_bar,
        additional_properties: struct
      )
    end

    # Serialize an instance of Foo to a JSON object
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
      obj.bar&.is_a?(String) != false || raise("Passed value for field obj.bar is not the expected type, validation failed.")
      obj.nullable_bar&.is_a?(String) != false || raise("Passed value for field obj.nullable_bar is not the expected type, validation failed.")
      obj.nullable_required_bar&.is_a?(String) != false || raise("Passed value for field obj.nullable_required_bar is not the expected type, validation failed.")
      obj.required_bar.is_a?(String) != false || raise("Passed value for field obj.required_bar is not the expected type, validation failed.")
    end
  end
end
