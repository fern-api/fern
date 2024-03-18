# frozen_string_literal: true

require "json"

module SeedUnionsClient
  class Union
    class GetShapeRequest
      attr_reader :id, :additional_properties

      # @param id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Union::GetShapeRequest]
      def initialize(id:, additional_properties: nil)
        # @type [String]
        @id = id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GetShapeRequest
      #
      # @param json_object [JSON]
      # @return [Union::GetShapeRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        id = struct.id
        new(id: id, additional_properties: struct)
      end

      # Serialize an instance of GetShapeRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "id": @id }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      end
    end
  end
end
