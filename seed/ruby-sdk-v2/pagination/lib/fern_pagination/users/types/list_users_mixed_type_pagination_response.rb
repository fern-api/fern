# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListUsersMixedTypePaginationResponse < Internal::Types::Model
        field :next_, -> { String }, optional: false, nullable: false, api_name: "next"
        field :data, -> { Internal::Types::Array[FernPagination::Users::Types::User] }, optional: false, nullable: false
      end
    end
  end
end
