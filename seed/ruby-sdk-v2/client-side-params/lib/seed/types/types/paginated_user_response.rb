# frozen_string_literal: true

module Seed
  module Types
    module Types
      # Response with pagination info like Auth0
      class PaginatedUserResponse < Internal::Types::Model
        field :users, -> { Internal::Types::Array[Seed::Types::Types::User] }, optional: false, nullable: false
        field :start, -> { Integer }, optional: false, nullable: false
        field :limit, -> { Integer }, optional: false, nullable: false
        field :length, -> { Integer }, optional: false, nullable: false
        field :total, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
