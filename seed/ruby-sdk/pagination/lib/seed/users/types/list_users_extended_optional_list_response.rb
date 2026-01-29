# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsersExtendedOptionalListResponse < Internal::Types::Model
        field :total_count, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
