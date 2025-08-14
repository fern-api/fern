# frozen_string_literal: true

module Seed
    module Types
        class MultipleFilterSearchRequest < Internal::Types::Model
            field :operator, Seed::Complex::MultipleFilterSearchRequestOperator, optional: true, nullable: false
            field :value, Seed::Complex::MultipleFilterSearchRequestValue, optional: true, nullable: false

    end
end
