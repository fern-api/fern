# frozen_string_literal: true

require_relative "types/RootType"
require "json"

module SeedClient
  module A
    class A < RootType
      attr_reader :additional_properties

      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [A::A]
      def initialze(additional_properties: nil)
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of A
      #
      # @param json_object [JSON]
      # @return [A::A]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        new(additional_properties: struct)
      end

      # Serialize an instance of A to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {}.to_json
      end
    end
  end
end
