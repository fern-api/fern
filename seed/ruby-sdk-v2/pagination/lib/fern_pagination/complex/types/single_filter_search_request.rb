# frozen_string_literal: true

module FernPagination
  module Complex
    module Types
      class SingleFilterSearchRequest < Internal::Types::Model
        field :field, -> { String }, optional: true, nullable: false
        field :operator, -> { FernPagination::Complex::Types::SingleFilterSearchRequestOperator }, optional: true, nullable: false
        field :value, -> { String }, optional: true, nullable: false
      end
    end
  end
end
