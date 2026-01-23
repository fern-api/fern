# frozen_string_literal: true

module FernPagination
  module Complex
    module Types
      class MultipleFilterSearchRequest < Internal::Types::Model
        field :operator, -> { FernPagination::Complex::Types::MultipleFilterSearchRequestOperator }, optional: true, nullable: false
        field :value, -> { FernPagination::Complex::Types::MultipleFilterSearchRequestValue }, optional: true, nullable: false
      end
    end
  end
end
