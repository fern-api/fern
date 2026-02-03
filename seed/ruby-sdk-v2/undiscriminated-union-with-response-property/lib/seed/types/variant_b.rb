# frozen_string_literal: true

module Seed
  module Types
    class VariantB < Internal::Types::Model
      field :type, -> { String }, optional: false, nullable: false
      field :value_b, -> { Integer }, optional: false, nullable: false, api_name: "valueB"
    end
  end
end
