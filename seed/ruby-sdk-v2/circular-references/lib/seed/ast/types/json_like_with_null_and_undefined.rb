# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class JsonLikeWithNullAndUndefined < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Array[Seed::Ast::Types::JsonLikeWithNullAndUndefined] }
        member -> { Internal::Types::Hash[String, Seed::Ast::Types::JsonLikeWithNullAndUndefined] }
        member -> { String }
        member -> { Integer }
        member -> { Internal::Types::Boolean }
      end
    end
  end
end
