# frozen_string_literal: true
require "commons/types/NodeId"
require "json"

module SeedClient
  module Commons
    class BinaryTreeValue
      attr_reader :root, :nodes, :additional_properties
      # @param root [Commons::NodeId] 
      # @param nodes [Hash{Commons::NodeId => Commons::NodeId}] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::BinaryTreeValue] 
      def initialze(root: nil, nodes:, additional_properties: nil)
        # @type [Commons::NodeId] 
        @root = root
        # @type [Hash{Commons::NodeId => Commons::NodeId}] 
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
        root Commons::NodeId.from_json(json_object: struct.root)
        nodes struct.nodes.transform_values() do | v |
  Commons::NodeId.from_json(json_object: v)
end
        new(root: root, nodes: nodes, additional_properties: struct)
      end
      # Serialize an instance of BinaryTreeValue to a JSON object
      #
      # @return [JSON] 
      def to_json
        { root: @root, nodes: @nodes.transform_values() do | v |
  Commons::NodeId.from_json(json_object: v)
end }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        obj.root.nil?() || NodeId.validate_raw(obj: obj.root)
        obj.nodes.is_a?(Hash) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
      end
    end
  end
end