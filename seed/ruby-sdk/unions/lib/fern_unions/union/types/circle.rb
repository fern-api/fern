# frozen_string_literal: true

require "json"

module SeedUnionsClient
  class Union
    class Circle
      attr_reader :radius, :additional_properties

      # @param radius [Float]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Union::Circle]
      def initialize(radius:, additional_properties: nil)
        # @type [Float]
        @radius = radius
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Circle
      #
      # @param json_object [JSON]
      # @return [Union::Circle]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        radius = struct.radius
        new(radius: radius, additional_properties: struct)
      end

      # Serialize an instance of Circle to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "radius": @radius }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.radius.is_a?(Float) != false || raise("Passed value for field obj.radius is not the expected type, validation failed.")
      end
    end
  end
end
