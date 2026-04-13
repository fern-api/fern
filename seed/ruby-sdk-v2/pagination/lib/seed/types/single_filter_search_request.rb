# frozen_string_literal: true

module Seed
  module Types
    class SingleFilterSearchRequest < Internal::Types::Model
      field :field, -> { String }, optional: true, nullable: false
      field :operator, -> { Seed::Types::SingleFilterSearchRequestOperator }, optional: true, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end
