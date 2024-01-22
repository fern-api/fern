# frozen_string_literal: true

require_relative "types/Docs"
require "json"

module SeedClient
  class Json < Docs
    attr_reader :raw, :additional_properties

    # @param raw [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Json]
    def initialze(raw:, additional_properties: nil)
      # @type [String]
      @raw = raw
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Json
    #
    # @param json_object [JSON]
    # @return [Json]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      raw = struct.raw
      new(raw: raw, additional_properties: struct)
    end

    # Serialize an instance of Json to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { raw: @raw }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.raw.is_a?(String) != false || raise("Passed value for field obj.raw is not the expected type, validation failed.")
    end
  end
end
