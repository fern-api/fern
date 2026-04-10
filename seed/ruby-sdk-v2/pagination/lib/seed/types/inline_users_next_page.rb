# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersNextPage < Internal::Types::Model
      field :page, -> { Integer }, optional: false, nullable: false
      field :starting_after, -> { String }, optional: false, nullable: false
    end
  end
end
