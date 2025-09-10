# frozen_string_literal: true

module Seed
  module User
    module Types
      class ListUsersRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
