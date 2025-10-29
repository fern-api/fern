# frozen_string_literal: true

module Seed
  module Types
    class VariantC < Internal::Types::Model
      field :type, -> { String }, optional: false, nullable: false
      field :value_c, -> { Internal::Types::Boolean }, optional: false, nullable: false
    end
  end
end
