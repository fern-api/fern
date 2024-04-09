# frozen_string_literal: true

require "ostruct"
require "json"

module SeedUnionsClient
  class Union
    class GetShapeRequest
      attr_reader :id, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUnionsClient::Union::GetShapeRequest]
      def initialize(id:, additional_properties: nil)
        # @type [String]
        @id = id
        @_field_set = { "id": @id }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of GetShapeRequest
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Union::GetShapeRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct["id"]
        new(id: id, additional_properties: struct)
      end

      # Serialize an instance of GetShapeRequest to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
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
