# frozen_string_literal: true
module Seed
    class UnionWithLiteral < Internal::Types::Object
        # Discriminant value
        field :type, String, optional: false, nullable: false# Discriminated union value
        field :Value, Object, optional: false, nullable: false
end
