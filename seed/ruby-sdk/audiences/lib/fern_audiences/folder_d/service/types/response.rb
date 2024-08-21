# frozen_string_literal: true

require "ostruct"
require "json"

module SeedAudiencesClient
  module FolderD
    class Service
      class Response
        # @return [String]
        attr_reader :foo
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param foo [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedAudiencesClient::FolderD::Service::Response]
        def initialize(foo:, additional_properties: nil)
          @foo = foo
          @additional_properties = additional_properties
          @_field_set = { "foo": foo }
        end

        # Deserialize a JSON object to an instance of Response
        #
        # @param json_object [String]
        # @return [SeedAudiencesClient::FolderD::Service::Response]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          foo = parsed_json["foo"]
          new(foo: foo, additional_properties: struct)
        end

        # Serialize an instance of Response to a JSON object
        #
        # @return [String]
        def to_json(*_args)
          @_field_set&.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given
        #  hash and check each fields type against the current object's property
        #  definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.foo.is_a?(String) != false || raise("Passed value for field obj.foo is not the expected type, validation failed.")
        end
      end
    end
  end
end
