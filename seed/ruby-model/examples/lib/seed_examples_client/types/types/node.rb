# frozen_string_literal: true

require_relative "tree"
require "json"

module SeedExamplesClient
  class Types
    class Node
      attr_reader :name, :nodes, :trees, :additional_properties

      # @param name [String]
      # @param nodes [Array<Types::Node>]
      # @param trees [Array<Types::Tree>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Node]
      def initialize(name:, nodes: nil, trees: nil, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [Array<Types::Node>]
        @nodes = nodes
        # @type [Array<Types::Tree>]
        @trees = trees
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Node
      #
      # @param json_object [JSON]
      # @return [Types::Node]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = struct.name
        nodes = parsed_json["nodes"]&.map do |v|
          v = v.to_json
          Types::Node.from_json(json_object: v)
        end
        trees = parsed_json["trees"]&.map do |v|
          v = v.to_json
          Types::Tree.from_json(json_object: v)
        end
        new(name: name, nodes: nodes, trees: trees, additional_properties: struct)
      end

      # Serialize an instance of Node to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "nodes": @nodes, "trees": @trees }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.nodes&.is_a?(Array) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
        obj.trees&.is_a?(Array) != false || raise("Passed value for field obj.trees is not the expected type, validation failed.")
      end
    end
  end
end
