# frozen_string_literal: true

require_relative "commons/types/NODE_ID"
require "json"

module SeedClient
  module Commons
    class BinaryTreeValue
      attr_reader :root, :nodes, :additional_properties

      # @param root [Commons::NODE_ID]
      # @param nodes [Hash{Commons::NODE_ID => Commons::NODE_ID}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::BinaryTreeValue]
      def initialze(nodes:, root: nil, additional_properties: nil)
        # @type [Commons::NODE_ID]
        @root = root
        # @type [Hash{Commons::NODE_ID => Commons::NODE_ID}]
        @nodes = nodes
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of BinaryTreeValue
      #
      # @param json_object [JSON]
      # @return [Commons::BinaryTreeValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        root = struct.root
        nodes = struct.nodes
        new(root: root, nodes: nodes, additional_properties: struct)
      end

      # Serialize an instance of BinaryTreeValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { root: @root, nodes: @nodes }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.root&.is_a?(String) != false || raise("Passed value for field obj.root is not the expected type, validation failed.")
        obj.nodes.is_a?(Hash) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
      end
    end
  end
end
