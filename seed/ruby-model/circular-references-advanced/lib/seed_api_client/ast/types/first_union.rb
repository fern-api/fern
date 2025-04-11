# frozen_string_literal: true

require "json"
require_relative "first_union_first_element"
require_relative "first_union_second_element"

module SeedApiClient
  class Ast
    class FirstUnion
      # Deserialize a JSON object to an instance of FirstUnion
      #
      # @param json_object [String]
      # @return [SeedApiClient::Ast::FirstUnion]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          SeedApiClient::Ast::FirstUnionFirstElement.validate_raw(obj: struct)
          return SeedApiClient::Ast::FirstUnionFirstElement.from_json(json_object: struct) unless struct.nil?

          return nil
        rescue StandardError
          # noop
        end
        begin
          SeedApiClient::Ast::FirstUnionSecondElement.validate_raw(obj: struct)
          return SeedApiClient::Ast::FirstUnionSecondElement.from_json(json_object: struct) unless struct.nil?

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
          return SeedApiClient::Ast::FirstUnionFirstElement.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return SeedApiClient::Ast::FirstUnionSecondElement.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
