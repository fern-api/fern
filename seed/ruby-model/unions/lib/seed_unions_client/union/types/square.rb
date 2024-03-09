# frozen_string_literal: true

require "json"

module SeedUnionsClient
  class Union
    class Square
      attr_reader :length, :additional_properties

      # @param length [Float]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Union::Square]
      def initialize(length:, additional_properties: nil)
        # @type [Float]
        @length = length
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Square
      #
      # @param json_object [JSON]
      # @return [Union::Square]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        length = struct.length
        new(length: length, additional_properties: struct)
      end

      # Serialize an instance of Square to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "length": @length }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.length.is_a?(Float) != false || raise("Passed value for field obj.length is not the expected type, validation failed.")
      end
    end
  end
end
