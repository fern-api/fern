# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListUsersBodyOffsetPaginationRequest < Internal::Types::Model
        field :pagination, -> { FernPagination::Users::Types::WithPage }, optional: true, nullable: false
      end
    end
  end
end
