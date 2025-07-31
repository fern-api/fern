# frozen_string_literal: true

require "ostruct"
require "json"

module SeedFileUploadClient
  class Service
    class MyInlineType
      # @return [String]
      attr_reader :bar
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param bar [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedFileUploadClient::Service::MyInlineType]
      def initialize(bar:, additional_properties: nil)
        @bar = bar
        @additional_properties = additional_properties
        @_field_set = { "bar": bar }
      end

      # Deserialize a JSON object to an instance of MyInlineType
      #
      # @param json_object [String]
      # @return [SeedFileUploadClient::Service::MyInlineType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        bar = parsed_json["bar"]
        new(bar: bar, additional_properties: struct)
      end

      # Serialize an instance of MyInlineType to a JSON object
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
        obj.bar.is_a?(String) != false || raise("Passed value for field obj.bar is not the expected type, validation failed.")
      end
    end
  end
end
