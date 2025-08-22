# frozen_string_literal: true

module Seed
  module User
    module Types
      class SearchUsersRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :user_id, -> { String }, optional: false, nullable: false
        field :limit, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
