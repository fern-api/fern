# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class ListUsersRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: true, nullable: false
        field :offset, -> { Integer }, optional: true, nullable: false
        field :include_deleted, lambda {
          Internal::Types::Boolean
        }, optional: true, nullable: false, api_name: "includeDeleted"
        field :sort_by, -> { String }, optional: true, nullable: false, api_name: "sortBy"
      end
    end
  end
end
