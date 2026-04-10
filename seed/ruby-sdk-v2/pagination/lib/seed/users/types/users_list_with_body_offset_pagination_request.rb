# frozen_string_literal: true

module Seed
  module Users
    module Types
      class UsersListWithBodyOffsetPaginationRequest < Internal::Types::Model
        field :pagination, -> { Seed::Types::WithPage }, optional: true, nullable: false
      end
    end
  end
end
