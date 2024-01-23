# frozen_string_literal: true

require "json"

module SeedClient
  class Json
    attr_reader :raw, :docs, :additional_properties

    # @param raw [String]
    # @param docs [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Json]
    def initialze(raw:, docs:, additional_properties: nil)
      # @type [String]
      @raw = raw
      # @type [String]
      @docs = docs
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
      docs = struct.docs
      new(raw: raw, docs: docs, additional_properties: struct)
    end

    # Serialize an instance of Json to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { "raw": @raw, "docs": @docs }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.raw.is_a?(String) != false || raise("Passed value for field obj.raw is not the expected type, validation failed.")
      obj.docs.is_a?(String) != false || raise("Passed value for field obj.docs is not the expected type, validation failed.")
    end
  end
end
