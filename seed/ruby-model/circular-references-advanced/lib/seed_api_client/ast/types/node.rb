# frozen_string_literal: true

require "json"
require_relative "branch_node"
require_relative "leaf_node"

module SeedApiClient
  class Ast
    class Node
      # Deserialize a JSON object to an instance of Node
      #
      # @param json_object [String]
      # @return [SeedApiClient::Ast::Node]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          SeedApiClient::Ast::BranchNode.validate_raw(obj: struct)
          return SeedApiClient::Ast::BranchNode.from_json(json_object: struct) unless struct.nil?

          return nil
        rescue StandardError
          # noop
        end
        begin
          SeedApiClient::Ast::LeafNode.validate_raw(obj: struct)
          return SeedApiClient::Ast::LeafNode.from_json(json_object: struct) unless struct.nil?

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
          return SeedApiClient::Ast::BranchNode.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return SeedApiClient::Ast::LeafNode.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
