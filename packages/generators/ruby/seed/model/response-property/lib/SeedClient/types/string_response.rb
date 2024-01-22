# frozen_string_literal: true
require "json"

module SeedClient
  class StringResponse
    attr_reader :data, :additional_properties
    # @param data [String] 
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [StringResponse] 
    def initialze(data:, additional_properties: nil)
      # @type [String] 
      @data = data
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end
    # Deserialize a JSON object to an instance of StringResponse
    #
    # @param json_object [JSON] 
    # @return [StringResponse] 
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      data struct.data
      new(data: data, additional_properties: struct)
    end
    # Serialize an instance of StringResponse to a JSON object
    #
    # @return [JSON] 
    def to_json
      { data: @data }.to_json()
    end
    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object] 
    # @return [Void] 
    def self.validate_raw(obj:)
      obj.data.is_a?(String) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
    end
  end
end