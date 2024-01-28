# frozen_string_literal: true

require_relative "node_id"
require "json"

module SeedClient
  module Commons
    class BinaryTreeNodeValue
      attr_reader :node_id, :val, :right, :left, :additional_properties

      # @param node_id [Commons::NODE_ID]
      # @param val [Float]
      # @param right [Commons::NODE_ID]
      # @param left [Commons::NODE_ID]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::BinaryTreeNodeValue]
      def initialize(node_id:, val:, right: nil, left: nil, additional_properties: nil)
        # @type [Commons::NODE_ID]
        @node_id = node_id
        # @type [Float]
        @val = val
        # @type [Commons::NODE_ID]
        @right = right
        # @type [Commons::NODE_ID]
        @left = left
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of BinaryTreeNodeValue
      #
      # @param json_object [JSON]
      # @return [Commons::BinaryTreeNodeValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        node_id = struct.nodeId
        val = struct.val
        right = struct.right
        left = struct.left
        new(node_id: node_id, val: val, right: right, left: left, additional_properties: struct)
      end

      # Serialize an instance of BinaryTreeNodeValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "nodeId": @node_id, "val": @val, "right": @right, "left": @left }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.node_id.is_a?(String) != false || raise("Passed value for field obj.node_id is not the expected type, validation failed.")
        obj.val.is_a?(Float) != false || raise("Passed value for field obj.val is not the expected type, validation failed.")
        obj.right&.is_a?(String) != false || raise("Passed value for field obj.right is not the expected type, validation failed.")
        obj.left&.is_a?(String) != false || raise("Passed value for field obj.left is not the expected type, validation failed.")
      end
    end
  end
end
