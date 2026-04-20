# frozen_string_literal: true

module Seed
  module Types
    class PaginatedResult < Internal::Types::Model
      field :paging, -> { Seed::Types::PagingCursors }, optional: false, nullable: false
      field :results, -> { Internal::Types::Array[Object] }, optional: false, nullable: false
    end
  end
end
