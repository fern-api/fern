# frozen_string_literal: true
require "commons/types/NodeId"
require "commons/types/NodeId"
require "json"

module SeedClient
  module Commons
    class SinglyLinkedListNodeValue
      attr_reader :node_id, :val, :next_, :additional_properties
      # @param node_id [Commons::NodeId] 
      # @param val [Float] 
      # @param next_ [Commons::NodeId] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::SinglyLinkedListNodeValue] 
      def initialze(node_id:, val:, next_: nil, additional_properties: nil)
        # @type [Commons::NodeId] 
        @node_id = node_id
        # @type [Float] 
        @val = val
        # @type [Commons::NodeId] 
        @next_ = next_
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of SinglyLinkedListNodeValue
      #
      # @param json_object [JSON] 
      # @return [Commons::SinglyLinkedListNodeValue] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        node_id = Commons::NodeId.from_json(json_object: struct.nodeId)
        val = struct.val
        next_ = Commons::NodeId.from_json(json_object: struct.next)
        new(node_id: node_id, val: val, next_: next_, additional_properties: struct)
      end
      # Serialize an instance of SinglyLinkedListNodeValue to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 nodeId: @node_id,
 val: @val,
 next: @next_
}.to_json()
      end
    end
  end
end