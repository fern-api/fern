# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class JSONLikeWithNullAndUndefined < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Array[Seed::Ast::Types::JSONLikeWithNullAndUndefined] }
        member -> { Internal::Types::Hash[String, Seed::Ast::Types::JSONLikeWithNullAndUndefined] }
        member -> { String }
        member -> { Integer }
        member -> { Internal::Types::Boolean }
      end
    end
  end
end
