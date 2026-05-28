# frozen_string_literal: true

module Seed
  module V2
    module Types
      class ListUsersRequest < Internal::Types::Model
        field :page_size, -> { Integer }, optional: true, nullable: false, api_name: "pageSize"
      end
    end
  end
end
