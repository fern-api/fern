# frozen_string_literal: true

module SeedClient
  module Types
    module Union
      class Dog
        attr_reader :name, :likes_to_woof, :additional_properties
        # @param name [String] 
        # @param likes_to_woof [Boolean] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Union::Dog] 
        def initialze(name:, likes_to_woof:, additional_properties: nil)
          # @type [String] 
          @name = name
          # @type [Boolean] 
          @likes_to_woof = likes_to_woof
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of Dog
        #
        # @param json_object [JSON] 
        # @return [Types::Union::Dog] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          name = struct.name
          likes_to_woof = struct.likesToWoof
          new(name: name, likes_to_woof: likes_to_woof, additional_properties: struct)
        end
        # Serialize an instance of Dog to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 name: @name,
 likesToWoof: @likes_to_woof
}.to_json()
        end
      end
    end
  end
end