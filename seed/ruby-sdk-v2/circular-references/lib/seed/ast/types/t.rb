# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class T < Internal::Types::Model
        field :child, -> { Seed::Ast::Types::TorU }, optional: false, nullable: false
      end
    end
  end
end
