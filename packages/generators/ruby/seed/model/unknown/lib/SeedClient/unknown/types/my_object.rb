# frozen_string_literal: true
require "json"

module SeedClient
  module Unknown
    class MyObject
      attr_reader :unknown, :additional_properties
      # @param unknown [Object] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Unknown::MyObject] 
      def initialze(unknown:, additional_properties: nil)
        # @type [Object] 
        @unknown = unknown
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of MyObject
      #
      # @param json_object [JSON] 
      # @return [Unknown::MyObject] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        unknown struct.unknown
        new(unknown: unknown, additional_properties: struct)
      end
      # Serialize an instance of MyObject to a JSON object
      #
      # @return [JSON] 
      def to_json
        { unknown: @unknown }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        obj.unknown.is_a?(Object) != false || raise("Passed value for field obj.unknown is not the expected type, validation failed.")
      end
    end
  end
end