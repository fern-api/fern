# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class UserOptionalListContainer < Internal::Types::Model
        field :users, -> { Internal::Types::Array[FernPagination::Users::Types::User] }, optional: true, nullable: false
      end
    end
  end
end
