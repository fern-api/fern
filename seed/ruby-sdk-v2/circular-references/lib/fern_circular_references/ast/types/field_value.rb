# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      class FieldValue < Internal::Types::Model
        extend FernCircularReferences::Internal::Types::Union

        discriminant :type

        member -> { FernCircularReferences::Ast::Types::PrimitiveValue }, key: "PRIMITIVE_VALUE"
        member -> { FernCircularReferences::Ast::Types::ObjectValue }, key: "OBJECT_VALUE"
        member -> { FernCircularReferences::Ast::Types::ContainerValue }, key: "CONTAINER_VALUE"
      end
    end
  end
end
