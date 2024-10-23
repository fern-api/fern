# frozen_string_literal: true

require "ostruct"
require "json"

module SeedAliasExtendsClient
  class Parent
    # @return [String]
    attr_reader :parent
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param parent [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedAliasExtendsClient::Parent]
    def initialize(parent:, additional_properties: nil)
      @parent = parent
      @additional_properties = additional_properties
      @_field_set = { "parent": parent }
    end

    # Deserialize a JSON object to an instance of Parent
    #
    # @param json_object [String]
    # @return [SeedAliasExtendsClient::Parent]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      parent = parsed_json["parent"]
      new(parent: parent, additional_properties: struct)
    end

    # Serialize an instance of Parent to a JSON object
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
      obj.parent.is_a?(String) != false || raise("Passed value for field obj.parent is not the expected type, validation failed.")
    end
  end
end
