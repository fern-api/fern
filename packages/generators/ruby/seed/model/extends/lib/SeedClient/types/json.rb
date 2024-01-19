# frozen_string_literal: true
require "types/Docs"
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
      # @type [OpenStruct] 
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
    def to_json
      {
 raw: @raw
}.to_json()
    end
  end
end