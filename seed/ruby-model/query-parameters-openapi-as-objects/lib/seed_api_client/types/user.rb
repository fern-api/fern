# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class User
    # @return [String]
    attr_reader :name
    # @return [Array<String>]
    attr_reader :tags
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param name [String]
    # @param tags [Array<String>]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::User]
    def initialize(name: OMIT, tags: OMIT, additional_properties: nil)
      @name = name if name != OMIT
      @tags = tags if tags != OMIT
      @additional_properties = additional_properties
      @_field_set = { "name": name, "tags": tags }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of User
    #
    # @param json_object [String]
    # @return [SeedApiClient::User]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      name = parsed_json["name"]
      tags = parsed_json["tags"]
      new(
        name: name,
        tags: tags,
        additional_properties: struct
      )
    end

    # Serialize an instance of User to a JSON object
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
      obj.name&.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      obj.tags&.is_a?(Array) != false || raise("Passed value for field obj.tags is not the expected type, validation failed.")
    end
  end
end
