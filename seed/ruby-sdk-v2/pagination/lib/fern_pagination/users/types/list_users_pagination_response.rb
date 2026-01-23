# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListUsersPaginationResponse < Internal::Types::Model
        field :has_next_page, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "hasNextPage"
        field :page, -> { FernPagination::Users::Types::Page }, optional: true, nullable: false
        field :total_count, -> { Integer }, optional: false, nullable: false
        field :data, -> { Internal::Types::Array[FernPagination::Users::Types::User] }, optional: false, nullable: false
      end
    end
  end
end
