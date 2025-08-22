# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class StartingAfterPaging < Internal::Types::Model
        field :per_page, -> { Integer }, optional: false, nullable: false
        field :starting_after, -> { String }, optional: true, nullable: false
      end
    end
  end
end
