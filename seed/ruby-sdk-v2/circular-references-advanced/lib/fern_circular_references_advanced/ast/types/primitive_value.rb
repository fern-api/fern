# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      module PrimitiveValue
        extend FernCircularReferencesAdvanced::Internal::Types::Enum

        STRING = "STRING"
        NUMBER = "NUMBER"
      end
    end
  end
end
