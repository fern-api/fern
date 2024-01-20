# frozen_string_literal: true

module SeedClient
  module FolderB
    module Common
      class Foo
        attr_reader :foo, :additional_properties
        # @param foo [FolderC::Common::Foo] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [FolderB::Common::Foo] 
        def initialze(foo: nil, additional_properties: nil)
          # @type [FolderC::Common::Foo] 
          @foo = foo
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of Foo
        #
        # @param json_object [JSON] 
        # @return [FolderB::Common::Foo] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          foo = FolderC::Common::Foo.from_json(json_object: struct.foo)
          new(foo: foo, additional_properties: struct)
        end
        # Serialize an instance of Foo to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 foo: @foo
}.to_json()
        end
      end
    end
  end
end