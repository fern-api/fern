# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsersAliasedDataRequest < Internal::Types::Model
        field :page, -> { Integer }, optional: true, nullable: false

        field :per_page, -> { Integer }, optional: true, nullable: false

        field :starting_after, -> { String }, optional: true, nullable: false
      end
    end
  end
end
