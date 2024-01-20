# frozen_string_literal: true

module SeedClient
  module Types
    module Object
      class ObjectWithRequiredField
        attr_reader :string, :additional_properties
        # @param string [String] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Object::ObjectWithRequiredField] 
        def initialze(string:, additional_properties: nil)
          # @type [String] 
          @string = string
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of ObjectWithRequiredField
        #
        # @param json_object [JSON] 
        # @return [Types::Object::ObjectWithRequiredField] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          string = struct.string
          new(string: string, additional_properties: struct)
        end
        # Serialize an instance of ObjectWithRequiredField to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 string: @string
}.to_json()
        end
      end
    end
  end
end