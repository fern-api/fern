# frozen_string_literal: true

require_relative "commons/types/NODE_ID"
require_relative "commons/types/DoublyLinkedListValue"
require "json"

module SeedClient
  module Commons
    class DoublyLinkedListNodeAndListValue
      attr_reader :node_id, :full_list, :additional_properties

      # @param node_id [Commons::NODE_ID]
      # @param full_list [Commons::DoublyLinkedListValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::DoublyLinkedListNodeAndListValue]
      def initialze(node_id:, full_list:, additional_properties: nil)
        # @type [Commons::NODE_ID]
        @node_id = node_id
        # @type [Commons::DoublyLinkedListValue]
        @full_list = full_list
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of DoublyLinkedListNodeAndListValue
      #
      # @param json_object [JSON]
      # @return [Commons::DoublyLinkedListNodeAndListValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        node_id = struct.nodeId
        full_list = Commons::DoublyLinkedListValue.from_json(json_object: struct.fullList)
        new(node_id: node_id, full_list: full_list, additional_properties: struct)
      end

      # Serialize an instance of DoublyLinkedListNodeAndListValue to a JSON object
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
        Commons::DoublyLinkedListValue.validate_raw(obj: obj.full_list)
      end
    end
  end
end
