# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class DebugVariableValue < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER_VALUE"
        member -> { Internal::Types::Boolean }, key: "BOOLEAN_VALUE"
        member -> { Integer }, key: "DOUBLE_VALUE"
        member -> { String }, key: "STRING_VALUE"
        member -> { String }, key: "CHAR_VALUE"
        member -> { Seed::Commons::Types::DebugMapValue }, key: "MAP_VALUE"
        member -> { Internal::Types::Array[Seed::Commons::Types::DebugVariableValue] }, key: "LIST_VALUE"
        member -> { Seed::Commons::Types::BinaryTreeNodeAndTreeValue }, key: "BINARY_TREE_NODE_VALUE"
        member -> { Seed::Commons::Types::SinglyLinkedListNodeAndListValue }, key: "SINGLY_LINKED_LIST_NODE_VALUE"
        member -> { Seed::Commons::Types::DoublyLinkedListNodeAndListValue }, key: "DOUBLY_LINKED_LIST_NODE_VALUE"
        member -> { Object }, key: "UNDEFINED_VALUE"
        member -> { Object }, key: "NULL_VALUE"
        member -> { Seed::Commons::Types::GenericValue }, key: "GENERIC_VALUE"
      end
    end
  end
end
