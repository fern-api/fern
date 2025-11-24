# frozen_string_literal: true

require "ostruct"
require "json"

module SeedUndiscriminatedUnionsClient
  class Union
    class TokenizeCard
      # @return [String]
      attr_reader :method_
      # @return [String]
      attr_reader :card_number
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param method_ [String]
      # @param card_number [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUndiscriminatedUnionsClient::Union::TokenizeCard]
      def initialize(method_:, card_number:, additional_properties: nil)
        @method_ = method_
        @card_number = card_number
        @additional_properties = additional_properties
        @_field_set = { "method": method_, "cardNumber": card_number }
      end

      # Deserialize a JSON object to an instance of TokenizeCard
      #
      # @param json_object [String]
      # @return [SeedUndiscriminatedUnionsClient::Union::TokenizeCard]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        method_ = parsed_json["method"]
        card_number = parsed_json["cardNumber"]
        new(
          method_: method_,
          card_number: card_number,
          additional_properties: struct
        )
      end

      # Serialize an instance of TokenizeCard to a JSON object
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
        obj.card_number.is_a?(String) != false || raise("Passed value for field obj.card_number is not the expected type, validation failed.")
      end
    end
  end
end
