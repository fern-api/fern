# frozen_string_literal: true

module Seed
  module Types
    class NestedObjectWithLiterals < Internal::Types::Model
      field :literal1, -> { Seed::Types::NestedObjectWithLiteralsLiteral1 }, optional: false, nullable: false
      field :literal2, -> { Seed::Types::NestedObjectWithLiteralsLiteral2 }, optional: false, nullable: false
      field :str_prop, -> { String }, optional: false, nullable: false, api_name: "strProp"
    end
  end
end
