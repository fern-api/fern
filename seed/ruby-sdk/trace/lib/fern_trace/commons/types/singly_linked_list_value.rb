# frozen_string_literal: true

require_relative "node_id"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class SinglyLinkedListValue
      attr_reader :head, :nodes, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param head [SeedTraceClient::Commons::NODE_ID]
      # @param nodes [Hash{SeedTraceClient::Commons::NODE_ID => SeedTraceClient::Commons::SinglyLinkedListNodeValue}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::SinglyLinkedListValue]
      def initialize(nodes:, head: OMIT, additional_properties: nil)
        # @type [SeedTraceClient::Commons::NODE_ID]
        @head = head if head != OMIT
        # @type [Hash{SeedTraceClient::Commons::NODE_ID => SeedTraceClient::Commons::SinglyLinkedListNodeValue}]
        @nodes = nodes
        @_field_set = { "head": @head, "nodes": @nodes }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SinglyLinkedListValue
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::SinglyLinkedListValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        head = struct["head"]
        nodes = parsed_json["nodes"]&.transform_values do |v|
          v = v.to_json
          SeedTraceClient::Commons::SinglyLinkedListNodeValue.from_json(json_object: v)
        end
        new(head: head, nodes: nodes, additional_properties: struct)
      end

      # Serialize an instance of SinglyLinkedListValue to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
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
