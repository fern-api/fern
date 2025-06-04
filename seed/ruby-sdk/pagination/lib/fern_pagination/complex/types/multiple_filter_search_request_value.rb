# frozen_string_literal: true

require "json"

module SeedPaginationClient
  class Complex
    class MultipleFilterSearchRequestValue
      # Deserialize a JSON object to an instance of MultipleFilterSearchRequestValue
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::MultipleFilterSearchRequestValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          struct.is_a?(Array) != false || raise("Passed value for field struct is not the expected type, validation failed.")
          return nil if struct.nil?

          return struct&.map do |item|
            item = item.to_json
            SeedPaginationClient::Complex::MultipleFilterSearchRequest.from_json(json_object: item)
          end
        rescue StandardError
          # noop
        end
        begin
          struct.is_a?(Array) != false || raise("Passed value for field struct is not the expected type, validation failed.")
          return nil if struct.nil?

          return struct&.map do |item|
            item = item.to_json
            SeedPaginationClient::Complex::SingleFilterSearchRequest.from_json(json_object: item)
          end
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
          return obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        rescue StandardError
          # noop
        end
        begin
          return obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
