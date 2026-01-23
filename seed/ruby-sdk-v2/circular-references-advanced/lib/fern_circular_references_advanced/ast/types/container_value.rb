# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class ContainerValue < Internal::Types::Model
        extend FernCircularReferencesAdvanced::Internal::Types::Union

        discriminant :type

        member -> { Internal::Types::Array[FernCircularReferencesAdvanced::Ast::Types::FieldValue] }, key: "LIST"
        member -> { FernCircularReferencesAdvanced::Ast::Types::FieldValue }, key: "OPTIONAL"
      end
    end
  end
end
