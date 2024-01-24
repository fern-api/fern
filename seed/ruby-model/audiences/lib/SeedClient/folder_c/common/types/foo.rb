# frozen_string_literal: true

require "json"

module SeedClient
  module FolderC
    module Common
      class Foo
        attr_reader :bar_property, :additional_properties

        # @param bar_property [UUID]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [FolderC::Common::Foo]
        def initialize(bar_property:, additional_properties: nil)
          # @type [UUID]
          @bar_property = bar_property
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Foo
        #
        # @param json_object [JSON]
        # @return [FolderC::Common::Foo]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          bar_property = struct.bar_property
          new(bar_property: bar_property, additional_properties: struct)
        end

        # Serialize an instance of Foo to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "bar_property": @bar_property }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.bar_property.is_a?(UUID) != false || raise("Passed value for field obj.bar_property is not the expected type, validation failed.")
        end
      end
    end
  end
end
