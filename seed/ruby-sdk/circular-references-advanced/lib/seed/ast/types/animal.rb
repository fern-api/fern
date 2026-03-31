# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class Animal < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Ast::Types::Cat }
        member -> { Seed::Ast::Types::Dog }
      end
    end
  end
end
