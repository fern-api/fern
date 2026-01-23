# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListUsersBodyCursorPaginationRequest < Internal::Types::Model
        field :pagination, -> { FernPagination::Users::Types::WithCursor }, optional: true, nullable: false
      end
    end
  end
end
