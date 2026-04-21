# frozen_string_literal: true

module Seed
  module Types
    class UserSearchResponse < Internal::Types::Model
      field :results, -> { Internal::Types::Array[Seed::Types::User] }, optional: true, nullable: false

      field :paging, -> { Seed::Types::PagingCursors }, optional: false, nullable: false
    end
  end
end
