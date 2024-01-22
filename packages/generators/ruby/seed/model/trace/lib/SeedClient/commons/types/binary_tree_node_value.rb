# frozen_string_literal: true

require_relative "commons/types/NodeId"
require "json"

module SeedClient
  module Commons
    class BinaryTreeNodeValue
      attr_reader :node_id, :val, :right, :left, :additional_properties

      # @param node_id [Commons::NodeId]
      # @param val [Float]
      # @param right [Commons::NodeId]
      # @param left [Commons::NodeId]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::BinaryTreeNodeValue]
      def initialze(node_id:, val:, right: nil, left: nil, additional_properties: nil)
        # @type [Commons::NodeId]
        @node_id = node_id
        # @type [Float]
        @val = val
        # @type [Commons::NodeId]
        @right = right
        # @type [Commons::NodeId]
        @left = left
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of BinaryTreeNodeValue
      #
      # @param json_object [JSON]
      # @return [Commons::BinaryTreeNodeValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        node_id = Commons::NodeId.from_json(json_object: struct.nodeId)
        val = struct.val
        right = Commons::NodeId.from_json(json_object: struct.right)
        left = Commons::NodeId.from_json(json_object: struct.left)
        new(node_id: node_id, val: val, right: right, left: left, additional_properties: struct)
      end

      # Serialize an instance of BinaryTreeNodeValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          nodeId: @node_id,
          val: @val,
          right: @right,
          left: @left
        }.to_json
      end
    end
  end
end
