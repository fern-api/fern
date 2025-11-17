# frozen_string_literal: true

module Seed
  module Bigunion
    module Types
      class JumboEnd < Internal::Types::Model
        field :value, -> { String }, optional: false, nullable: false
      end
    end
  end
end
