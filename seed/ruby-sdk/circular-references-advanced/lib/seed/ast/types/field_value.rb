# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class FieldValue < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Ast::Types::PrimitiveValue }, key: "PRIMITIVE_VALUE"
        member -> { Seed::Ast::Types::ObjectValue }, key: "OBJECT_VALUE"
        member -> { Seed::Ast::Types::ContainerValue }, key: "CONTAINER_VALUE"
      end
    end
  end
end
