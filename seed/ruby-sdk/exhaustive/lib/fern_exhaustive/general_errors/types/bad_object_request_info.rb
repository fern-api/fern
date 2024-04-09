# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExhaustiveClient
  class GeneralErrors
    class BadObjectRequestInfo
      attr_reader :message, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param message [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExhaustiveClient::GeneralErrors::BadObjectRequestInfo]
      def initialize(message:, additional_properties: nil)
        # @type [String]
        @message = message
        @_field_set = { "message": @message }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of BadObjectRequestInfo
      #
      # @param json_object [String]
      # @return [SeedExhaustiveClient::GeneralErrors::BadObjectRequestInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        message = struct["message"]
        new(message: message, additional_properties: struct)
      end

      # Serialize an instance of BadObjectRequestInfo to a JSON object
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
        obj.message.is_a?(String) != false || raise("Passed value for field obj.message is not the expected type, validation failed.")
      end
    end
  end
end
