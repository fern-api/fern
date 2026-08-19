# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class Cat < Internal::Types::Model
        field :fruit, -> { Seed::Ast::Types::Fruit }, optional: false, nullable: false
      end
    end
  end
end
