# frozen_string_literal: true

module Seed
  module Types
    class MultipleFilterSearchRequest < Internal::Types::Model
      field :operator, -> { Seed::Types::MultipleFilterSearchRequestOperator }, optional: true, nullable: false
      field :value, -> { Seed::Types::MultipleFilterSearchRequestValue }, optional: true, nullable: false
    end
  end
end
