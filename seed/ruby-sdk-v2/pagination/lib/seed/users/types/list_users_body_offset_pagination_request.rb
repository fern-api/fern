# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsersBodyOffsetPaginationRequest < Internal::Types::Model
        field :pagination, -> { Seed::Users::Types::WithPage }, optional: true, nullable: false
      end
    end
  end
end
