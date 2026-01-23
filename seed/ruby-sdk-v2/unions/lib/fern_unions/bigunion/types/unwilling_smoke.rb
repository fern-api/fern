# frozen_string_literal: true

module FernUnions
  module Bigunion
    module Types
      class UnwillingSmoke < Internal::Types::Model
        field :value, -> { String }, optional: false, nullable: false
      end
    end
  end
end
