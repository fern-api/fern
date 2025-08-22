# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class MultipleFilterSearchRequest < Internal::Types::Model
        field :operator, lambda {
          Seed::Complex::Types::MultipleFilterSearchRequestOperator
        }, optional: true, nullable: false
        field :value, -> { Seed::Complex::Types::MultipleFilterSearchRequestValue }, optional: true, nullable: false
      end
    end
  end
end
