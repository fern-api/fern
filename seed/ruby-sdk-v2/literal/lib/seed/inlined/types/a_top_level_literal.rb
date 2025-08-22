# frozen_string_literal: true

module Seed
  module Inlined
    module Types
      class ATopLevelLiteral < Internal::Types::Model
        field :nested_literal, -> { Seed::Inlined::Types::ANestedLiteral }, optional: false, nullable: false
      end
    end
  end
end
