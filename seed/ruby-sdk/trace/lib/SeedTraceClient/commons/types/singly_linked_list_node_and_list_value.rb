# frozen_string_literal: true

require_relative "node_id"
require_relative "singly_linked_list_value"
require "json"

module SeedTraceClient
  module Commons
    class SinglyLinkedListNodeAndListValue
      attr_reader :node_id, :full_list, :additional_properties

      # @param node_id [Commons::NODE_ID]
      # @param full_list [Commons::SinglyLinkedListValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::SinglyLinkedListNodeAndListValue]
      def initialize(node_id:, full_list:, additional_properties: nil)
        # @type [Commons::NODE_ID]
        @node_id = node_id
        # @type [Commons::SinglyLinkedListValue]
        @full_list = full_list
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of SinglyLinkedListNodeAndListValue
      #
      # @param json_object [JSON]
      # @return [Commons::SinglyLinkedListNodeAndListValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        node_id = struct.nodeId
        full_list = struct.fullList.to_h.to_json
        full_list = Commons::SinglyLinkedListValue.from_json(json_object: full_list)
        new(node_id: node_id, full_list: full_list, additional_properties: struct)
      end

      # Serialize an instance of SinglyLinkedListNodeAndListValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "nodeId": @node_id, "fullList": @full_list }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.node_id.is_a?(String) != false || raise("Passed value for field obj.node_id is not the expected type, validation failed.")
        Commons::SinglyLinkedListValue.validate_raw(obj: obj.full_list)
      end
    end
  end
end
