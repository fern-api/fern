# frozen_string_literal: true

require "ostruct"
require "json"

module SeedFileUploadClient
  class Service
    class MyObjectWithOptional
      # @return [String]
      attr_reader :prop
      # @return [String]
      attr_reader :optional_prop
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param prop [String]
      # @param optional_prop [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedFileUploadClient::Service::MyObjectWithOptional]
      def initialize(prop:, optional_prop: OMIT, additional_properties: nil)
        @prop = prop
        @optional_prop = optional_prop if optional_prop != OMIT
        @additional_properties = additional_properties
        @_field_set = { "prop": prop, "optionalProp": optional_prop }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of MyObjectWithOptional
      #
      # @param json_object [String]
      # @return [SeedFileUploadClient::Service::MyObjectWithOptional]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        prop = parsed_json["prop"]
        optional_prop = parsed_json["optionalProp"]
        new(
          prop: prop,
          optional_prop: optional_prop,
          additional_properties: struct
        )
      end

      # Serialize an instance of MyObjectWithOptional to a JSON object
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
        obj.prop.is_a?(String) != false || raise("Passed value for field obj.prop is not the expected type, validation failed.")
        obj.optional_prop&.is_a?(String) != false || raise("Passed value for field obj.optional_prop is not the expected type, validation failed.")
      end
    end
  end
end
