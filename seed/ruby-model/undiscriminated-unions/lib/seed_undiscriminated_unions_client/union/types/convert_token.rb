# frozen_string_literal: true

require "ostruct"
require "json"

module SeedUndiscriminatedUnionsClient
  class Union
    class ConvertToken
      # @return [String]
      attr_reader :method_
      # @return [String]
      attr_reader :token_id
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param method_ [String]
      # @param token_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUndiscriminatedUnionsClient::Union::ConvertToken]
      def initialize(method_:, token_id:, additional_properties: nil)
        @method_ = method_
        @token_id = token_id
        @additional_properties = additional_properties
        @_field_set = { "method": method_, "tokenId": token_id }
      end

      # Deserialize a JSON object to an instance of ConvertToken
      #
      # @param json_object [String]
      # @return [SeedUndiscriminatedUnionsClient::Union::ConvertToken]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        method_ = parsed_json["method"]
        token_id = parsed_json["tokenId"]
        new(
          method_: method_,
          token_id: token_id,
          additional_properties: struct
        )
      end

      # Serialize an instance of ConvertToken to a JSON object
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
        obj.method_.is_a?(String) != false || raise("Passed value for field obj.method_ is not the expected type, validation failed.")
        obj.token_id.is_a?(String) != false || raise("Passed value for field obj.token_id is not the expected type, validation failed.")
      end
    end
  end
end
