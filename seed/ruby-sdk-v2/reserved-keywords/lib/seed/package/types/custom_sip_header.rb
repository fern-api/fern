# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Package
    module Types
      class CustomSipHeader < Internal::Types::Model
        field :key, -> { String }, optional: false, nullable: false

        field :value, -> { String }, optional: false, nullable: false
      end
    end
  end
end
