# frozen_string_literal: true

module Seed
  module Types
    class ATopLevelLiteral < Internal::Types::Model
      field :nested_literal, -> { Seed::Types::ANestedLiteral }, optional: false, nullable: false, api_name: "nestedLiteral"
    end
  end
end
