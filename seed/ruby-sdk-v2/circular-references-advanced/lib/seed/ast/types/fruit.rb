# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Ast
    module Types
      class Fruit < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Ast::Types::Acai }

        member -> { Seed::Ast::Types::Fig }
      end
    end
  end
end
