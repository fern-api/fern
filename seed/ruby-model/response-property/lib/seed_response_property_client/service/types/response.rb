# frozen_string_literal: true

require_relative "movie"
require "ostruct"
require "json"

module SeedResponsePropertyClient
  class Service
    class Response
      # @return [SeedResponsePropertyClient::Service::Movie]
      attr_reader :data
      # @return [Hash{String => String}]
      attr_reader :metadata
      # @return [String]
      attr_reader :docs
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param data [SeedResponsePropertyClient::Service::Movie]
      # @param metadata [Hash{String => String}]
      # @param docs [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedResponsePropertyClient::Service::Response]
      def initialize(data:, metadata:, docs:, additional_properties: nil)
        @data = data
        @metadata = metadata
        @docs = docs
        @additional_properties = additional_properties
        @_field_set = { "data": data, "metadata": metadata, "docs": docs }
      end

      # Deserialize a JSON object to an instance of Response
      #
      # @param json_object [String]
      # @return [SeedResponsePropertyClient::Service::Response]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["data"].nil?
          data = nil
        else
          data = parsed_json["data"].to_json
          data = SeedResponsePropertyClient::Service::Movie.from_json(json_object: data)
        end
        metadata = parsed_json["metadata"]
        docs = parsed_json["docs"]
        new(
          data: data,
          metadata: metadata,
          docs: docs,
          additional_properties: struct
        )
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
        SeedResponsePropertyClient::Service::Movie.validate_raw(obj: obj.data)
        obj.metadata.is_a?(Hash) != false || raise("Passed value for field obj.metadata is not the expected type, validation failed.")
        obj.docs.is_a?(String) != false || raise("Passed value for field obj.docs is not the expected type, validation failed.")
      end
    end
  end
end
