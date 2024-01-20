# frozen_string_literal: true

module SeedClient
  module Types
    module Object
      class ObjectWithMapOfMap
        attr_reader :map, :additional_properties
        # @param map [Hash{String => String}] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Object::ObjectWithMapOfMap] 
        def initialze(map:, additional_properties: nil)
          # @type [Hash{String => String}] 
          @map = map
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of ObjectWithMapOfMap
        #
        # @param json_object [JSON] 
        # @return [Types::Object::ObjectWithMapOfMap] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          map = struct.map
          new(map: map, additional_properties: struct)
        end
        # Serialize an instance of ObjectWithMapOfMap to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 map: @map
}.to_json()
        end
      end
    end
  end
end