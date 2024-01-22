# frozen_string_literal: true

require_relative "types/types/Movie"
require "json"

module SeedClient
  module Types
    class ExtendedMovie < Types::Movie
      attr_reader :cast, :additional_properties

      # @param cast [Array<String>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::ExtendedMovie]
      def initialze(cast:, additional_properties: nil)
        # @type [Array<String>]
        @cast = cast
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ExtendedMovie
      #
      # @param json_object [JSON]
      # @return [Types::ExtendedMovie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        cast = struct.cast
        new(cast: cast, additional_properties: struct)
      end

      # Serialize an instance of ExtendedMovie to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { cast: @cast }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.cast.is_a?(Array) != false || raise("Passed value for field obj.cast is not the expected type, validation failed.")
      end
    end
  end
end
