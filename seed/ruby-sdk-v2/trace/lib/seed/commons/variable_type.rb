# frozen_string_literal: true

module Seed
    module Types
        class VariableType < Internal::Types::Union

            discriminant :type

            member -> { Object }, key: "INTEGER_TYPE"
            member -> { Object }, key: "DOUBLE_TYPE"
            member -> { Object }, key: "BOOLEAN_TYPE"
            member -> { Object }, key: "STRING_TYPE"
            member -> { Object }, key: "CHAR_TYPE"
            member -> { Seed::Commons::ListType }, key: "LIST_TYPE"
            member -> { Seed::Commons::MapType }, key: "MAP_TYPE"
            member -> { Object }, key: "BINARY_TREE_TYPE"
            member -> { Object }, key: "SINGLY_LINKED_LIST_TYPE"
            member -> { Object }, key: "DOUBLY_LINKED_LIST_TYPE"
    end
end
