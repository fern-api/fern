# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class UserPage < Internal::Types::Model
        field :data, -> { FernPagination::Users::Types::UserListContainer }, optional: false, nullable: false
        field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
      end
    end
  end
end
