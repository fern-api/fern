# frozen_string_literal: true

require_relative "types/types/Node"
require "json"

module SeedClient
  module Types
    class Tree
      attr_reader :nodes, :additional_properties

      # @param nodes [Array<Types::Node>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Tree]
      def initialze(nodes: nil, additional_properties: nil)
        # @type [Array<Types::Node>]
        @nodes = nodes
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Tree
      #
      # @param json_object [JSON]
      # @return [Types::Tree]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        nodes = struct.nodes.map do |v|
          Types::Node.from_json(json_object: v)
        end
        new(nodes: nodes, additional_properties: struct)
      end

      # Serialize an instance of Tree to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { nodes: @nodes }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.nodes&.is_a?(Array) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
      end
    end
  end
end
