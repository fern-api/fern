# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class Berry < Internal::Types::Model
        field :animal, -> { Seed::Ast::Types::Animal }, optional: false, nullable: false
      end
    end
  end
end
