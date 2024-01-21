# frozen_string_literal: true
require "folder_b/common/types/Foo"
require "json"

module SeedClient
  module FolderA
    module Service
      class Response
        attr_reader :foo, :additional_properties
        # @param foo [FolderB::Common::Foo] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [FolderA::Service::Response] 
        def initialze(foo: nil, additional_properties: nil)
          # @type [FolderB::Common::Foo] 
          @foo = foo
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of Response
        #
        # @param json_object [JSON] 
        # @return [FolderA::Service::Response] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          foo = FolderB::Common::Foo.from_json(json_object: struct.foo)
          new(foo: foo, additional_properties: struct)
        end
        # Serialize an instance of Response to a JSON object
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