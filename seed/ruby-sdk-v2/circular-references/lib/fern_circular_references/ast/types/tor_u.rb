# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      class TorU < Internal::Types::Model
        extend FernCircularReferences::Internal::Types::Union

        member -> { FernCircularReferences::Ast::Types::T }
        member -> { FernCircularReferences::Ast::Types::U }
      end
    end
  end
end
