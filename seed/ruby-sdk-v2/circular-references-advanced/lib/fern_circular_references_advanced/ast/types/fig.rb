# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class Fig < Internal::Types::Model
        field :animal, -> { FernCircularReferencesAdvanced::Ast::Types::Animal }, optional: false, nullable: false
      end
    end
  end
end
