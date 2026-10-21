# frozen_string_literal: true

require_relative "../.."

module Seed
  module Ast
    module Types
      class JSONLike < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Array[Seed::Ast::Types::JSONLike] }

        member -> { Internal::Types::Hash[String, Seed::Ast::Types::JSONLike] }

        member -> { String }

        member -> { Integer }

        member -> { Internal::Types::Boolean }
      end
    end
  end
end
