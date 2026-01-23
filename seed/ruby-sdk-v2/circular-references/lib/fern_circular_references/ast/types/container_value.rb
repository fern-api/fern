# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      class ContainerValue < Internal::Types::Model
        extend FernCircularReferences::Internal::Types::Union

        discriminant :type

        member -> { Internal::Types::Array[FernCircularReferences::Ast::Types::FieldValue] }, key: "LIST"
        member -> { FernCircularReferences::Ast::Types::FieldValue }, key: "OPTIONAL"
      end
    end
  end
end
