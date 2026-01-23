# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class Animal < Internal::Types::Model
        extend FernCircularReferencesAdvanced::Internal::Types::Union

        member -> { FernCircularReferencesAdvanced::Ast::Types::Cat }
        member -> { FernCircularReferencesAdvanced::Ast::Types::Dog }
      end
    end
  end
end
