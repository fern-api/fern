# frozen_string_literal: true
require "json"

module SeedClient
  module Service
    class MyObject
      attr_reader :foo, :additional_properties
      # @param foo [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::MyObject] 
      def initialze(foo:, additional_properties: nil)
        # @type [String] 
        @foo = foo
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of MyObject
      #
      # @param json_object [JSON] 
      # @return [Service::MyObject] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        foo = struct.foo
        new(foo: foo, additional_properties: struct)
      end
      # Serialize an instance of MyObject to a JSON object
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