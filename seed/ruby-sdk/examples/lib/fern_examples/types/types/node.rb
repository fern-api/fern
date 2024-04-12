# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Node
      # @return [String]
      attr_reader :name
      # @return [Object]
      attr_reader :nodes
      # @return [Object]
      attr_reader :trees
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param nodes [Object]
      # @param trees [Object]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Node]
      def initialize(name:, nodes: OMIT, trees: OMIT, additional_properties: nil)
        @name = name
        @nodes = nodes if nodes != OMIT
        @trees = trees if trees != OMIT
        @additional_properties = additional_properties
        @_field_set = { "name": name, "nodes": nodes, "trees": trees }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Node
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Node]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct["name"]
        nodes = struct["nodes"]
        trees = struct["trees"]
        new(
          name: name,
          nodes: nodes,
          trees: trees,
          additional_properties: struct
        )
      end

      # Serialize an instance of Node to a JSON object
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
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.nodes&.is_a?(Object) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
        obj.trees&.is_a?(Object) != false || raise("Passed value for field obj.trees is not the expected type, validation failed.")
      end
    end
  end
end
