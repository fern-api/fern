# frozen_string_literal: true

require_relative "commons/types/NodeId"
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
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of SinglyLinkedListNodeValue
      #
      # @param json_object [JSON]
      # @return [Commons::SinglyLinkedListNodeValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        node_id Commons::NodeId.from_json(json_object: struct.nodeId)
        val struct.val
        next_ Commons::NodeId.from_json(json_object: struct.next)
        new(node_id: node_id, val: val, next_: next_, additional_properties: struct)
      end

      # Serialize an instance of SinglyLinkedListNodeValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { nodeId: @node_id, val: @val, next: @next_ }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        NodeId.validate_raw(obj: obj.node_id)
        obj.val.is_a?(Float) != false || raise("Passed value for field obj.val is not the expected type, validation failed.")
        obj.next_.nil? || NodeId.validate_raw(obj: obj.next_)
      end
    end
  end
end
