# frozen_string_literal: true
require "json"

module SeedClient
  class WithMetadata
    attr_reader :metadata, :additional_properties
    # @param metadata [Hash{String => String}] 
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [WithMetadata] 
    def initialze(metadata:, additional_properties: nil)
      # @type [Hash{String => String}] 
      @metadata = metadata
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end
    # Deserialize a JSON object to an instance of WithMetadata
    #
    # @param json_object [JSON] 
    # @return [WithMetadata] 
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      metadata struct.metadata
      new(metadata: metadata, additional_properties: struct)
    end
    # Serialize an instance of WithMetadata to a JSON object
    #
    # @return [JSON] 
    def to_json
      { metadata: @metadata }.to_json()
    end
    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object] 
    # @return [Void] 
    def self.validate_raw(obj:)
      obj.metadata.is_a?(Hash) != false || raise("Passed value for field obj.metadata is not the expected type, validation failed.")
    end
  end
end