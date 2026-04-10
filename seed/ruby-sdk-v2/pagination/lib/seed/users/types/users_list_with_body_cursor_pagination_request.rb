# frozen_string_literal: true

module Seed
  module Users
    module Types
      class UsersListWithBodyCursorPaginationRequest < Internal::Types::Model
        field :pagination, -> { Seed::Types::WithCursor }, optional: true, nullable: false
      end
    end
  end
end
