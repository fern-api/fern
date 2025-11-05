# frozen_string_literal: true

module Seed
  module Inlined
    module Types
      class ATopLevelLiteral < Internal::Types::Model
        field :nested_literal, lambda {
          Seed::Inlined::Types::ANestedLiteral
        }, optional: false, nullable: false, api_name: "nestedLiteral"
      end
    end
  end
end
