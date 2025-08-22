# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsersBodyCursorPaginationRequest < Internal::Types::Model
        field :pagination, -> { Seed::Users::Types::WithCursor }, optional: true, nullable: false
      end
    end
  end
end
