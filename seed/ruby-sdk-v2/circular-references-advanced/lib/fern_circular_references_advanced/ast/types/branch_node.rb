# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class BranchNode < Internal::Types::Model
        field :children, -> { Internal::Types::Array[FernCircularReferencesAdvanced::Ast::Types::Node] }, optional: false, nullable: false
      end
    end
  end
end
