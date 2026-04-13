# frozen_string_literal: true

module Seed
  module Types
    class UnionBar < Internal::Types::Model
      field :bar, -> { Seed::Types::Bar }, optional: true, nullable: false
    end
  end
end
