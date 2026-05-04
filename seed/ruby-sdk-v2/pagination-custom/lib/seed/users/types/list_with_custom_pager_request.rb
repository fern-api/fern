# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListWithCustomPagerRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: true, nullable: false

        field :starting_after, -> { String }, optional: true, nullable: false
      end
    end
  end
end
