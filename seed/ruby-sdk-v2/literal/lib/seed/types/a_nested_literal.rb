# frozen_string_literal: true

module Seed
  module Types
    class ANestedLiteral < Internal::Types::Model
      field :my_literal, -> { Seed::Types::ANestedLiteralMyLiteral }, optional: false, nullable: false, api_name: "myLiteral"
    end
  end
end
