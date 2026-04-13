# frozen_string_literal: true

module Seed
  module User
    module Types
      class UserListRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
