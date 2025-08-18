# frozen_string_literal: true

module Seed
    module Types
        class ContainerValue < Internal::Types::Union

            discriminant :type

            member -> { Internal::Types::Array[Seed::Ast::FieldValue] }, key: "LIST"
            member -> { Seed::Ast::FieldValue }, key: "OPTIONAL"
    end
end
