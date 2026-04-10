# frozen_string_literal: true

module Seed
  module Types
    class UnionWithLiteral < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithLiteralType }, optional: false, nullable: false
      field :value, -> { Seed::Types::UnionWithLiteralValue }, optional: true, nullable: false
    end
  end
end
