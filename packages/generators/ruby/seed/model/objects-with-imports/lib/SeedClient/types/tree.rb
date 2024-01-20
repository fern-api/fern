# frozen_string_literal: true

require_relative "types/Node"
require "json"

module SeedClient
  class Tree
    attr_reader :nodes, :additional_properties

    # @param nodes [Array<Node>]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Tree]
    def initialze(nodes: nil, additional_properties: nil)
      # @type [Array<Node>]
      @nodes = nodes
      # @type [OpenStruct]
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Tree
    #
    # @param json_object [JSON]
    # @return [Tree]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      nodes = struct.nodes.map do |v|
        Node.from_json(json_object: v)
      end
      new(nodes: nodes, additional_properties: struct)
    end

    # Serialize an instance of Tree to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      {
        nodes: @nodes
      }.to_json
    end
  end
end
