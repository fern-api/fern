# frozen_string_literal: true

require_relative "commons/types/NodeId"
require_relative "commons/types/BinaryTreeValue"
require "json"

module SeedClient
  module Commons
    class BinaryTreeNodeAndTreeValue
      attr_reader :node_id, :full_tree, :additional_properties

      # @param node_id [Commons::NodeId]
      # @param full_tree [Commons::BinaryTreeValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::BinaryTreeNodeAndTreeValue]
      def initialze(node_id:, full_tree:, additional_properties: nil)
        # @type [Commons::NodeId]
        @node_id = node_id
        # @type [Commons::BinaryTreeValue]
        @full_tree = full_tree
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of BinaryTreeNodeAndTreeValue
      #
      # @param json_object [JSON]
      # @return [Commons::BinaryTreeNodeAndTreeValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        node_id Commons::NodeId.from_json(json_object: struct.nodeId)
        full_tree Commons::BinaryTreeValue.from_json(json_object: struct.fullTree)
        new(node_id: node_id, full_tree: full_tree, additional_properties: struct)
      end

      # Serialize an instance of BinaryTreeNodeAndTreeValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { nodeId: @node_id, fullTree: @full_tree }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        NodeId.validate_raw(obj: obj.node_id)
        BinaryTreeValue.validate_raw(obj: obj.full_tree)
      end
    end
  end
end
