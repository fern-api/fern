# frozen_string_literal: true

module Seed
    module Types
        class VariableValue < Internal::Types::Union

            discriminant :type

            member -> { Integer }, key: "INTEGER_VALUE"
            member -> { Internal::Types::Boolean }, key: "BOOLEAN_VALUE"
            member -> { Integer }, key: "DOUBLE_VALUE"
            member -> { String }, key: "STRING_VALUE"
            member -> { String }, key: "CHAR_VALUE"
            member -> { Seed::Commons::MapValue }, key: "MAP_VALUE"
            member -> { Internal::Types::Array[Seed::Commons::VariableValue] }, key: "LIST_VALUE"
            member -> { Seed::Commons::BinaryTreeValue }, key: "BINARY_TREE_VALUE"
            member -> { Seed::Commons::SinglyLinkedListValue }, key: "SINGLY_LINKED_LIST_VALUE"
            member -> { Seed::Commons::DoublyLinkedListValue }, key: "DOUBLY_LINKED_LIST_VALUE"
            member -> { Object }, key: "NULL_VALUE"
    end
end
