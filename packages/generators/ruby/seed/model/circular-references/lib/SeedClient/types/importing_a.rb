# frozen_string_literal: true
require "a/types/A"
require "json"

module SeedClient
  class ImportingA
    attr_reader :a, :additional_properties
    # @param a [A::A] 
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [ImportingA] 
    def initialze(a: nil, additional_properties: nil)
      # @type [A::A] 
      @a = a
      # @type [OpenStruct] 
      @additional_properties = additional_properties
    end
    # Deserialize a JSON object to an instance of ImportingA
    #
    # @param json_object [JSON] 
    # @return [ImportingA] 
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      a = A::A.from_json(json_object: struct.a)
      new(a: a, additional_properties: struct)
    end
    # Serialize an instance of ImportingA to a JSON object
    #
    # @return [JSON] 
    def to_json
      {
 a: @a
}.to_json()
    end
  end
end