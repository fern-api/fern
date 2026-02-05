# frozen_string_literal: true

require "json"
require_relative "tokenize_card"
require_relative "convert_token"

module SeedUndiscriminatedUnionsClient
  class Union
    # Tests that nested properties with camelCase wire names are properly
    #  converted from snake_case Ruby keys when passed as Hash values.
    class PaymentMethodUnion
      # Deserialize a JSON object to an instance of PaymentMethodUnion
      #
      # @param json_object [String]
      # @return [SeedUndiscriminatedUnionsClient::Union::PaymentMethodUnion]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          SeedUndiscriminatedUnionsClient::Union::TokenizeCard.validate_raw(obj: struct)
          return SeedUndiscriminatedUnionsClient::Union::TokenizeCard.from_json(json_object: struct) unless struct.nil?

          return nil
        rescue StandardError
          # noop
        end
        begin
          SeedUndiscriminatedUnionsClient::Union::ConvertToken.validate_raw(obj: struct)
          return SeedUndiscriminatedUnionsClient::Union::ConvertToken.from_json(json_object: struct) unless struct.nil?

          return nil
        rescue StandardError
          # noop
        end
        struct
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        begin
          return SeedUndiscriminatedUnionsClient::Union::TokenizeCard.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return SeedUndiscriminatedUnionsClient::Union::ConvertToken.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
