# frozen_string_literal: true

module Seed
  module Types
    module Types
      # Paginated response for clients listing
      class PaginatedClientResponse < Internal::Types::Model
        field :start, -> { Integer }, optional: false, nullable: false
        field :limit, -> { Integer }, optional: false, nullable: false
        field :length, -> { Integer }, optional: false, nullable: false
        field :total, -> { Integer }, optional: true, nullable: false
        field :clients, -> { Internal::Types::Array[Seed::Types::Types::Client] }, optional: false, nullable: false
      end
    end
  end
end
