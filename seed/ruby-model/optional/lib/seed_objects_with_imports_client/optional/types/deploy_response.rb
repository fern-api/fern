# frozen_string_literal: true

require "ostruct"
require "json"

module SeedObjectsWithImportsClient
  class Optional
    class DeployResponse
      # @return [Boolean]
      attr_reader :success
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param success [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedObjectsWithImportsClient::Optional::DeployResponse]
      def initialize(success:, additional_properties: nil)
        @success = success
        @additional_properties = additional_properties
        @_field_set = { "success": success }
      end

      # Deserialize a JSON object to an instance of DeployResponse
      #
      # @param json_object [String]
      # @return [SeedObjectsWithImportsClient::Optional::DeployResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        success = parsed_json["success"]
        new(success: success, additional_properties: struct)
      end

      # Serialize an instance of DeployResponse to a JSON object
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
        obj.success.is_a?(Boolean) != false || raise("Passed value for field obj.success is not the expected type, validation failed.")
      end
    end
  end
end
