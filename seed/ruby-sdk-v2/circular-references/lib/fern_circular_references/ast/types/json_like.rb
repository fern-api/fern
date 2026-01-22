# frozen_string_literal: true

module FernCircularReferences
  module Ast
    module Types
      class JsonLike < Internal::Types::Model
        extend FernCircularReferences::Internal::Types::Union

        member -> { Internal::Types::Array[FernCircularReferences::Ast::Types::JsonLike] }
        member -> { Internal::Types::Hash[String, FernCircularReferences::Ast::Types::JsonLike] }
        member -> { String }
        member -> { Integer }
        member -> { Internal::Types::Boolean }
      end
    end
  end
end
