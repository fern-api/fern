# frozen_string_literal: true

require_relative "../../../folder_b/common/types/foo"
require "ostruct"
require "json"

module SeedAudiencesClient
  module FolderA
    class Service
      class Response
        # @return [SeedAudiencesClient::FolderB::Common::Foo]
        attr_reader :foo
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param foo [SeedAudiencesClient::FolderB::Common::Foo]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedAudiencesClient::FolderA::Service::Response]
        def initialize(foo: OMIT, additional_properties: nil)
          @foo = foo if foo != OMIT
          @additional_properties = additional_properties
          @_field_set = { "foo": foo }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of Response
        #
        # @param json_object [String]
        # @return [SeedAudiencesClient::FolderA::Service::Response]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          if parsed_json["foo"].nil?
            foo = nil
          else
            foo = parsed_json["foo"].to_json
            foo = SeedAudiencesClient::FolderB::Common::Foo.from_json(json_object: foo)
          end
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
          obj.foo.nil? || SeedAudiencesClient::FolderB::Common::Foo.validate_raw(obj: obj.foo)
        end
      end
    end
  end
end
