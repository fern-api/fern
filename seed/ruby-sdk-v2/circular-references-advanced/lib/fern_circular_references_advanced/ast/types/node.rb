# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class Node < Internal::Types::Model
        extend FernCircularReferencesAdvanced::Internal::Types::Union

        member -> { FernCircularReferencesAdvanced::Ast::Types::BranchNode }
        member -> { FernCircularReferencesAdvanced::Ast::Types::LeafNode }
      end
    end
  end
end
