# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class Fruit < Internal::Types::Model
        extend FernCircularReferencesAdvanced::Internal::Types::Union

        member -> { FernCircularReferencesAdvanced::Ast::Types::Acai }
        member -> { FernCircularReferencesAdvanced::Ast::Types::Fig }
      end
    end
  end
end
