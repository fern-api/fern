# frozen_string_literal: true

module Seed
  module Service
    module Types
      class RegularPatchRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :field_1, -> { String }, optional: true, nullable: false
        field :field_2, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
