# frozen_string_literal: true

require_relative "../.."

module Seed
  module Bigunion
    module Types
      class RotatingRatio < Internal::Types::Model
        field :value, -> { String }, optional: false, nullable: false
      end
    end
  end
end
