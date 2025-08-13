# frozen_string_literal: true

module Seed
    module Types
        class FieldValue < Internal::Types::Union

            discriminant :type

            member -> { Seed::Ast::PrimitiveValue }, key: "PRIMITIVE_VALUE"
            member -> { Seed::Ast::ObjectValue }, key: "OBJECT_VALUE"
            member -> { Seed::Ast::ContainerValue }, key: "CONTAINER_VALUE"
    end
end
