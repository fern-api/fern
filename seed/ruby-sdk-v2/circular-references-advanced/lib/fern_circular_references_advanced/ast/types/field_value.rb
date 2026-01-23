# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Ast
    module Types
      class FieldValue < Internal::Types::Model
        extend FernCircularReferencesAdvanced::Internal::Types::Union

        discriminant :type

        member -> { FernCircularReferencesAdvanced::Ast::Types::PrimitiveValue }, key: "PRIMITIVE_VALUE"
        member -> { FernCircularReferencesAdvanced::Ast::Types::ObjectValue }, key: "OBJECT_VALUE"
        member -> { FernCircularReferencesAdvanced::Ast::Types::ContainerValue }, key: "CONTAINER_VALUE"
      end
    end
  end
end
