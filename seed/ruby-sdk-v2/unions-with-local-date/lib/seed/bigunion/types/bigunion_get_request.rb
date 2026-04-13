# frozen_string_literal: true

module Seed
  module Bigunion
    module Types
      class BigunionGetRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
