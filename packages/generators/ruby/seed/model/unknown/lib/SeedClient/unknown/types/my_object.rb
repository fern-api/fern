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
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of MyObject
      #
      # @param json_object [JSON]
      # @return [Unknown::MyObject]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        unknown = struct.unknown
        new(unknown: unknown, additional_properties: struct)
      end

      # Serialize an instance of MyObject to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          unknown: @unknown
        }.to_json
      end
    end
  end
end
