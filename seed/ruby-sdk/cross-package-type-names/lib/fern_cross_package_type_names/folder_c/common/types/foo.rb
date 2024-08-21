# frozen_string_literal: true

require "ostruct"
require "json"

module SeedCrossPackageTypeNamesClient
  module FolderC
    class Common
      class Foo
        # @return [String]
        attr_reader :bar_property
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param bar_property [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedCrossPackageTypeNamesClient::FolderC::Common::Foo]
        def initialize(bar_property:, additional_properties: nil)
          @bar_property = bar_property
          @additional_properties = additional_properties
          @_field_set = { "bar_property": bar_property }
        end

        # Deserialize a JSON object to an instance of Foo
        #
        # @param json_object [String]
        # @return [SeedCrossPackageTypeNamesClient::FolderC::Common::Foo]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          bar_property = parsed_json["bar_property"]
          new(bar_property: bar_property, additional_properties: struct)
        end

        # Serialize an instance of Foo to a JSON object
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
          obj.bar_property.is_a?(String) != false || raise("Passed value for field obj.bar_property is not the expected type, validation failed.")
        end
      end
    end
  end
end
