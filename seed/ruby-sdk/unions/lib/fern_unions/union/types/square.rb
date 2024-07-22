# frozen_string_literal: true

require "ostruct"
require "json"

module SeedUnionsClient
  class Union
    class Square
      # @return [Float]
      attr_reader :length
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param length [Float]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUnionsClient::Union::Square]
      def initialize(length:, additional_properties: nil)
        @length = length
        @additional_properties = additional_properties
        @_field_set = { "length": length }
      end

      # Deserialize a JSON object to an instance of Square
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Union::Square]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        length = parsed_json["length"]
        new(length: length, additional_properties: struct)
      end

      # Serialize an instance of Square to a JSON object
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
        obj.length.is_a?(Float) != false || raise("Passed value for field obj.length is not the expected type, validation failed.")
      end
    end
  end
end
