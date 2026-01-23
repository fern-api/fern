# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      class U < Internal::Types::Model
        field :child, -> { FernCircularReferences::Ast::Types::T }, optional: false, nullable: false
      end
    end
  end
end
