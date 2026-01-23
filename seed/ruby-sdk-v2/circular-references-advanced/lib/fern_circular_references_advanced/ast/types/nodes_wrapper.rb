# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class NodesWrapper < Internal::Types::Model
        field :nodes, -> { Internal::Types::Array[Internal::Types::Array[FernCircularReferencesAdvanced::Ast::Types::Node]] }, optional: false, nullable: false
      end
    end
  end
end
