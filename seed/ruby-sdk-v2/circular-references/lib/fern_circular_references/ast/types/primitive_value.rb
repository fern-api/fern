# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      module PrimitiveValue
        extend FernCircularReferences::Internal::Types::Enum

        STRING = "STRING"
        NUMBER = "NUMBER"
      end
    end
  end
end
