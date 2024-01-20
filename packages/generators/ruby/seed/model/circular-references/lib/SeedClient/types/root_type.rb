# frozen_string_literal: true

module SeedClient
  class RootType
    attr_reader :s, :additional_properties
    # @param s [String] 
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [RootType] 
    def initialze(s:, additional_properties: nil)
      # @type [String] 
      @s = s
      # @type [OpenStruct] 
      @additional_properties = additional_properties
    end
    # Deserialize a JSON object to an instance of RootType
    #
    # @param json_object [JSON] 
    # @return [RootType] 
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      s = struct.s
      new(s: s, additional_properties: struct)
    end
    # Serialize an instance of RootType to a JSON object
    #
    # @return [JSON] 
    def to_json
      {
 s: @s
}.to_json()
    end
  end
end