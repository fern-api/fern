# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class TorU < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Ast::Types::T }
        member -> { Seed::Ast::Types::U }
      end
    end
  end
end
