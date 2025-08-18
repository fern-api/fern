# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class ContainerValue < Internal::Types::Union

        discriminant :type

        member -> { Internal::Types::Array[Seed::Ast::Types::FieldValue] }, key: "LIST"
        member -> { Seed::Ast::Types::FieldValue }, key: "OPTIONAL"
      end
    end
  end
end
