# frozen_string_literal: true

module Seed
  module Types
    class U < Internal::Types::Model
      field :child, -> { Seed::Types::T }, optional: false, nullable: false
    end
  end
end
