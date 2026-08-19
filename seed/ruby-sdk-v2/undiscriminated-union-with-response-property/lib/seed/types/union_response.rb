# frozen_string_literal: true

module Seed
  module Types
    class UnionResponse < Internal::Types::Model
      field :data, -> { Seed::Types::MyUnion }, optional: false, nullable: false
    end
  end
end
