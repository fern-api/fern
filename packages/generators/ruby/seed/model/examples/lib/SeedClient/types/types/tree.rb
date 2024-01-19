# frozen_string_literal: true
require "types/types/Node"
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
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Tree
      #
      # @param json_object [JSON] 
      # @return [Types::Tree] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        nodes = struct.nodes.map() do | v |
 Types::Node.from_json(json_object: v)
end
        new(nodes: nodes, additional_properties: struct)
      end
      # Serialize an instance of Tree to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 nodes: @nodes
}.to_json()
      end
    end
  end
end