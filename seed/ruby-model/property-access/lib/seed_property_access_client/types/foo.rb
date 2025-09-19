# frozen_string_literal: true

require "ostruct"
require "json"

module SeedPropertyAccessClient
  class Foo
    # @return [String]
    attr_reader :normal
    # @return [String]
    attr_reader :read
    # @return [String]
    attr_reader :write
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param normal [String]
    # @param read [String]
    # @param write [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedPropertyAccessClient::Foo]
    def initialize(normal:, read:, write:, additional_properties: nil)
      @normal = normal
      @read = read
      @write = write
      @additional_properties = additional_properties
      @_field_set = { "normal": normal, "read": read, "write": write }
    end

    # Deserialize a JSON object to an instance of Foo
    #
    # @param json_object [String]
    # @return [SeedPropertyAccessClient::Foo]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      normal = parsed_json["normal"]
      read = parsed_json["read"]
      write = parsed_json["write"]
      new(
        normal: normal,
        read: read,
        write: write,
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
      obj.normal.is_a?(String) != false || raise("Passed value for field obj.normal is not the expected type, validation failed.")
      obj.read.is_a?(String) != false || raise("Passed value for field obj.read is not the expected type, validation failed.")
      obj.write.is_a?(String) != false || raise("Passed value for field obj.write is not the expected type, validation failed.")
    end
  end
end
