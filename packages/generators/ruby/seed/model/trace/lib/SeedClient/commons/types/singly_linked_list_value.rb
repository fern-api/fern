# frozen_string_literal: true

require_relative "node_id"
require "json"

module SeedClient
  module Commons
    class SinglyLinkedListValue
      attr_reader :head, :nodes, :additional_properties

      # @param head [Commons::NODE_ID]
      # @param nodes [Hash{Commons::NODE_ID => Commons::NODE_ID}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::SinglyLinkedListValue]
      def initialize(nodes:, head: nil, additional_properties: nil)
        # @type [Commons::NODE_ID]
        @head = head
        # @type [Hash{Commons::NODE_ID => Commons::NODE_ID}]
        @nodes = nodes
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of SinglyLinkedListValue
      #
      # @param json_object [JSON]
      # @return [Commons::SinglyLinkedListValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        head = struct.head
        nodes = struct.nodes
        new(head: head, nodes: nodes, additional_properties: struct)
      end

      # Serialize an instance of SinglyLinkedListValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "head": @head, "nodes": @nodes }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.head&.is_a?(String) != false || raise("Passed value for field obj.head is not the expected type, validation failed.")
        obj.nodes.is_a?(Hash) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
      end
    end
  end
end
