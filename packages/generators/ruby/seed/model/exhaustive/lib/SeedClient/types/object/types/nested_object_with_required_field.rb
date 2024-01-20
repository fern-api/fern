# frozen_string_literal: true

module SeedClient
  module Types
    module Object
      class NestedObjectWithRequiredField
        attr_reader :string, :nested_object, :additional_properties
        # @param string [String] 
        # @param nested_object [Types::Object::ObjectWithOptionalField] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Object::NestedObjectWithRequiredField] 
        def initialze(string:, nested_object:, additional_properties: nil)
          # @type [String] 
          @string = string
          # @type [Types::Object::ObjectWithOptionalField] 
          @nested_object = nested_object
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of NestedObjectWithRequiredField
        #
        # @param json_object [JSON] 
        # @return [Types::Object::NestedObjectWithRequiredField] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          string = struct.string
          nested_object = Types::Object::ObjectWithOptionalField.from_json(json_object: struct.NestedObject)
          new(string: string, nested_object: nested_object, additional_properties: struct)
        end
        # Serialize an instance of NestedObjectWithRequiredField to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 string: @string,
 NestedObject: @nested_object
}.to_json()
        end
      end
    end
  end
end