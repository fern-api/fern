# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      class JsonLikeWithNullAndUndefined < Internal::Types::Model
        extend FernCircularReferences::Internal::Types::Union

        member -> { Internal::Types::Array[FernCircularReferences::Ast::Types::JsonLikeWithNullAndUndefined] }
        member -> { Internal::Types::Hash[String, FernCircularReferences::Ast::Types::JsonLikeWithNullAndUndefined] }
        member -> { String }
        member -> { Integer }
        member -> { Internal::Types::Boolean }
      end
    end
  end
end
