# frozen_string_literal: true

module FernLiteral
  module Inlined
    module Types
      class ATopLevelLiteral < Internal::Types::Model
        field :nested_literal, -> { FernLiteral::Inlined::Types::ANestedLiteral }, optional: false, nullable: false, api_name: "nestedLiteral"
      end
    end
  end
end
