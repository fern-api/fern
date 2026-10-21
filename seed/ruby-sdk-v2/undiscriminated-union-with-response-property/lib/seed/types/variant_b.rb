# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class VariantB < Internal::Types::Model
      field :type, -> { String }, optional: false, nullable: false

      field :value_b, -> { Integer }, optional: false, nullable: false, api_name: "valueB"
    end
  end
end
