# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class RefreshTokenRequest
      # @return [Integer]
      attr_reader :ttl
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param ttl [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::RefreshTokenRequest]
      def initialize(ttl:, additional_properties: nil)
        @ttl = ttl
        @additional_properties = additional_properties
        @_field_set = { "ttl": ttl }
      end

      # Deserialize a JSON object to an instance of RefreshTokenRequest
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::RefreshTokenRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        ttl = parsed_json["ttl"]
        new(ttl: ttl, additional_properties: struct)
      end

      # Serialize an instance of RefreshTokenRequest to a JSON object
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
        obj.ttl.is_a?(Integer) != false || raise("Passed value for field obj.ttl is not the expected type, validation failed.")
      end
    end
  end
end
