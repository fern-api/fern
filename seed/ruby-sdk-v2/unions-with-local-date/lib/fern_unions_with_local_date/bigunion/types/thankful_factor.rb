# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Bigunion
    module Types
      class ThankfulFactor < Internal::Types::Model
        field :value, -> { String }, optional: false, nullable: false
      end
    end
  end
end
