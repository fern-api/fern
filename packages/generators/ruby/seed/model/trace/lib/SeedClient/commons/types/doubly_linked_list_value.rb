# frozen_string_literal: true

module SeedClient
  module Commons
    class DoublyLinkedListValue
      attr_reader :head, :nodes, :additional_properties
      # @param head [Commons::NodeId] 
      # @param nodes [Hash{Commons::NodeId => Commons::NodeId}] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::DoublyLinkedListValue] 
      def initialze(head: nil, nodes:, additional_properties: nil)
        # @type [Commons::NodeId] 
        @head = head
        # @type [Hash{Commons::NodeId => Commons::NodeId}] 
        @nodes = nodes
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of DoublyLinkedListValue
      #
      # @param json_object [JSON] 
      # @return [Commons::DoublyLinkedListValue] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        head = Commons::NodeId.from_json(json_object: struct.head)
        nodes = struct.nodes.transform_values() do | v |
 Commons::NodeId.from_json(json_object: v)
end
        new(head: head, nodes: nodes, additional_properties: struct)
      end
      # Serialize an instance of DoublyLinkedListValue to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 head: @head,
 nodes: @nodes.transform_values() do | v |\n Commons::NodeId.from_json(json_object: v)\nend
}.to_json()
      end
    end
  end
end