# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      class T < Internal::Types::Model
        field :child, -> { FernCircularReferences::Ast::Types::TorU }, optional: false, nullable: false
      end
    end
  end
end
