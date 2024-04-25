# frozen_string_literal: true

require "json"
require_relative "list_type"
require_relative "map_type"

module SeedTraceClient
  class Commons
    class VariableType
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Commons::VariableType]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of VariableType
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::VariableType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "integerType"
                   nil
                 when "doubleType"
                   nil
                 when "booleanType"
                   nil
                 when "stringType"
                   nil
                 when "charType"
                   nil
                 when "listType"
                   SeedTraceClient::Commons::ListType.from_json(json_object: json_object)
                 when "mapType"
                   SeedTraceClient::Commons::MapType.from_json(json_object: json_object)
                 when "binaryTreeType"
                   nil
                 when "singlyLinkedListType"
                   nil
                 when "doublyLinkedListType"
                   nil
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "integerType"
          { type: @discriminant }.to_json
        when "doubleType"
          { type: @discriminant }.to_json
        when "booleanType"
          { type: @discriminant }.to_json
        when "stringType"
          { type: @discriminant }.to_json
        when "charType"
          { type: @discriminant }.to_json
        when "listType"
          { **@member.to_json, type: @discriminant }.to_json
        when "mapType"
          { **@member.to_json, type: @discriminant }.to_json
        when "binaryTreeType"
          { type: @discriminant }.to_json
        when "singlyLinkedListType"
          { type: @discriminant }.to_json
        when "doublyLinkedListType"
          { type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "integerType"
          # noop
        when "doubleType"
          # noop
        when "booleanType"
          # noop
        when "stringType"
          # noop
        when "charType"
          # noop
        when "listType"
          SeedTraceClient::Commons::ListType.validate_raw(obj: obj)
        when "mapType"
          SeedTraceClient::Commons::MapType.validate_raw(obj: obj)
        when "binaryTreeType"
          # noop
        when "singlyLinkedListType"
          # noop
        when "doublyLinkedListType"
          # noop
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.integer_type
        new(member: nil, discriminant: "integerType")
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.double_type
        new(member: nil, discriminant: "doubleType")
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.boolean_type
        new(member: nil, discriminant: "booleanType")
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.string_type
        new(member: nil, discriminant: "stringType")
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.char_type
        new(member: nil, discriminant: "charType")
      end

      # @param member [SeedTraceClient::Commons::ListType]
      # @return [SeedTraceClient::Commons::VariableType]
      def self.list_type(member:)
        new(member: member, discriminant: "listType")
      end

      # @param member [SeedTraceClient::Commons::MapType]
      # @return [SeedTraceClient::Commons::VariableType]
      def self.map_type(member:)
        new(member: member, discriminant: "mapType")
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.binary_tree_type
        new(member: nil, discriminant: "binaryTreeType")
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.singly_linked_list_type
        new(member: nil, discriminant: "singlyLinkedListType")
      end

      # @return [SeedTraceClient::Commons::VariableType]
      def self.doubly_linked_list_type
        new(member: nil, discriminant: "doublyLinkedListType")
      end
    end
  end
end
