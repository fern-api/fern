# frozen_string_literal: true

module Seed
  module Types
    class VariantA < Internal::Types::Model
      field :type, -> { String }, optional: false, nullable: false
      field :value_a, -> { String }, optional: false, nullable: false
    end
  end
end
