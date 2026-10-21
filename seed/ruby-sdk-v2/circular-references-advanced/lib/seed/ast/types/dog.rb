# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Ast
    module Types
      class Dog < Internal::Types::Model
        field :fruit, -> { Seed::Ast::Types::Fruit }, optional: false, nullable: false
      end
    end
  end
end
