# frozen_string_literal: true

require_relative "../../../folder_b/common/types/foo"
require "json"

module SeedAudiencesClient
  module FolderA
    class Service
      class Response
        attr_reader :foo, :additional_properties

        # @param foo [FolderB::Common::Foo]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [FolderA::Service::Response]
        def initialize(foo: nil, additional_properties: nil)
          # @type [FolderB::Common::Foo]
          @foo = foo
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Response
        #
        # @param json_object [JSON]
        # @return [FolderA::Service::Response]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          if parsed_json["foo"].nil?
            foo = nil
          else
            foo = parsed_json["foo"].to_json
            foo = FolderB::Common::Foo.from_json(json_object: foo)
          end
          new(foo: foo, additional_properties: struct)
        end

        # Serialize an instance of Response to a JSON object
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
          obj.foo.nil? || FolderB::Common::Foo.validate_raw(obj: obj.foo)
        end
      end
    end
  end
end
