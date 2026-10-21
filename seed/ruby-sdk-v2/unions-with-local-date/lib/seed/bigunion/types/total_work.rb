# frozen_string_literal: true

require_relative "../.."

module Seed
  module Bigunion
    module Types
      class TotalWork < Internal::Types::Model
        field :value, -> { String }, optional: false, nullable: false
      end
    end
  end
end
