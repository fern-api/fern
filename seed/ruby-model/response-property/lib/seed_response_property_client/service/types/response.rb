# frozen_string_literal: true

require_relative "movie"
require "json"

module SeedResponsePropertyClient
  module Service
    class Response
      attr_reader :data, :metadata, :docs, :additional_properties

      # @param data [Service::Movie]
      # @param metadata [Hash{String => String}]
      # @param docs [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::Response]
      def initialize(data:, metadata:, docs:, additional_properties: nil)
        # @type [Service::Movie]
        @data = data
        # @type [Hash{String => String}]
        @metadata = metadata
        # @type [String]
        @docs = docs
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Response
      #
      # @param json_object [JSON]
      # @return [Service::Response]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        data = struct.data
        metadata = struct.metadata
        docs = struct.docs
        new(data: data, metadata: metadata, docs: docs, additional_properties: struct)
      end

      # Serialize an instance of Response to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "data": @data, "metadata": @metadata, "docs": @docs }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Service::Movie.validate_raw(obj: obj.data)
        obj.metadata.is_a?(Hash) != false || raise("Passed value for field obj.metadata is not the expected type, validation failed.")
        obj.docs.is_a?(String) != false || raise("Passed value for field obj.docs is not the expected type, validation failed.")
      end
    end
  end
end
