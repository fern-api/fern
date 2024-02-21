# frozen_string_literal: true

require_relative "node_id"
require_relative "binary_tree_value"
require "json"

module SeedTraceClient
  class Commons
    class BinaryTreeNodeAndTreeValue
      attr_reader :node_id, :full_tree, :additional_properties

      # @param node_id [Commons::NODE_ID]
      # @param full_tree [Commons::BinaryTreeValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::BinaryTreeNodeAndTreeValue]
      def initialize(node_id:, full_tree:, additional_properties: nil)
        # @type [Commons::NODE_ID]
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
        parsed_json = JSON.parse(json_object)
        node_id = struct.nodeId
        if parsed_json["fullTree"].nil?
          full_tree = nil
        else
          full_tree = parsed_json["fullTree"].to_json
          full_tree = Commons::BinaryTreeValue.from_json(json_object: full_tree)
        end
        new(node_id: node_id, full_tree: full_tree, additional_properties: struct)
      end

      # Serialize an instance of BinaryTreeNodeAndTreeValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "nodeId": @node_id, "fullTree": @full_tree }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.node_id.is_a?(String) != false || raise("Passed value for field obj.node_id is not the expected type, validation failed.")
        Commons::BinaryTreeValue.validate_raw(obj: obj.full_tree)
      end
    end
  end
end
