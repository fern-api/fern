# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class U < Internal::Types::Model
        field :child, -> { Seed::Ast::Types::T }, optional: false, nullable: false
      end
    end
  end
end
