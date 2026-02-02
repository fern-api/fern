# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class JsonLike < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Array[Seed::Ast::Types::JsonLike] }
        member -> { Internal::Types::Hash[String, Seed::Ast::Types::JsonLike] }
        member -> { String }
        member -> { Integer }
        member -> { Internal::Types::Boolean }
      end
    end
  end
end
