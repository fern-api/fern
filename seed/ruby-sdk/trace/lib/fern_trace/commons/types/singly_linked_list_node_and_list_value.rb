# frozen_string_literal: true

require_relative "singly_linked_list_value"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class SinglyLinkedListNodeAndListValue
      # @return [String]
      attr_reader :node_id
      # @return [SeedTraceClient::Commons::SinglyLinkedListValue]
      attr_reader :full_list
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param node_id [String]
      # @param full_list [SeedTraceClient::Commons::SinglyLinkedListValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::SinglyLinkedListNodeAndListValue]
      def initialize(node_id:, full_list:, additional_properties: nil)
        @node_id = node_id
        @full_list = full_list
        @additional_properties = additional_properties
        @_field_set = { "nodeId": node_id, "fullList": full_list }
      end

      # Deserialize a JSON object to an instance of SinglyLinkedListNodeAndListValue
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::SinglyLinkedListNodeAndListValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        node_id = parsed_json["nodeId"]
        if parsed_json["fullList"].nil?
          full_list = nil
        else
          full_list = parsed_json["fullList"].to_json
          full_list = SeedTraceClient::Commons::SinglyLinkedListValue.from_json(json_object: full_list)
        end
        new(
          node_id: node_id,
          full_list: full_list,
          additional_properties: struct
        )
      end

      # Serialize an instance of SinglyLinkedListNodeAndListValue to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.node_id.is_a?(String) != false || raise("Passed value for field obj.node_id is not the expected type, validation failed.")
        SeedTraceClient::Commons::SinglyLinkedListValue.validate_raw(obj: obj.full_list)
      end
    end
  end
end
