# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class VariableValue < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER_VALUE"
        member -> { Internal::Types::Boolean }, key: "BOOLEAN_VALUE"
        member -> { Integer }, key: "DOUBLE_VALUE"
        member -> { String }, key: "STRING_VALUE"
        member -> { String }, key: "CHAR_VALUE"
        member -> { FernTrace::Commons::Types::MapValue }, key: "MAP_VALUE"
        member -> { Internal::Types::Array[FernTrace::Commons::Types::VariableValue] }, key: "LIST_VALUE"
        member -> { FernTrace::Commons::Types::BinaryTreeValue }, key: "BINARY_TREE_VALUE"
        member -> { FernTrace::Commons::Types::SinglyLinkedListValue }, key: "SINGLY_LINKED_LIST_VALUE"
        member -> { FernTrace::Commons::Types::DoublyLinkedListValue }, key: "DOUBLY_LINKED_LIST_VALUE"
        member -> { Object }, key: "NULL_VALUE"
      end
    end
  end
end
