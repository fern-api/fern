# frozen_string_literal: true

module Seed
  module Types
    class UserSearchResponse < Internal::Types::Model
      field :paging, -> { Seed::Types::PagingCursors }, optional: false, nullable: false

      field :results, -> { Internal::Types::Array[Seed::Types::User] }, optional: true, nullable: false
    end
  end
end
