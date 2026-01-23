# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class Cat < Internal::Types::Model
        field :fruit, -> { FernCircularReferencesAdvanced::Ast::Types::Fruit }, optional: false, nullable: false
      end
    end
  end
end
