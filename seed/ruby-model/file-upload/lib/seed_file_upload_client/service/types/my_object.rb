# frozen_string_literal: true

require "json"

module SeedFileUploadClient
  class Service
    class MyObject
      attr_reader :foo, :additional_properties

      # @param foo [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::MyObject]
      def initialize(foo:, additional_properties: nil)
        # @type [String]
        @foo = foo
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of MyObject
      #
      # @param json_object [JSON]
      # @return [Service::MyObject]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        foo = struct.foo
        new(foo: foo, additional_properties: struct)
      end

      # Serialize an instance of MyObject to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "foo": @foo }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.foo.is_a?(String) != false || raise("Passed value for field obj.foo is not the expected type, validation failed.")
      end
    end
  end
end
