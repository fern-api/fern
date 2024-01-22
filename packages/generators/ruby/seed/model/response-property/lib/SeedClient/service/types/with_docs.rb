# frozen_string_literal: true

require "json"

module SeedClient
  module Service
    class WithDocs
      attr_reader :docs, :additional_properties

      # @param docs [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::WithDocs]
      def initialze(docs:, additional_properties: nil)
        # @type [String]
        @docs = docs
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WithDocs
      #
      # @param json_object [JSON]
      # @return [Service::WithDocs]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        docs struct.docs
        new(docs: docs, additional_properties: struct)
      end

      # Serialize an instance of WithDocs to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { docs: @docs }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.docs.is_a?(String) != false || raise("Passed value for field obj.docs is not the expected type, validation failed.")
      end
    end
  end
end
