# frozen_string_literal: true

module Seed
  module User
    module Types
      class CreateUserRequest < Internal::Types::Model
        field :type, -> { String }, optional: false, nullable: false, api_name: "_type"
        field :version, -> { String }, optional: false, nullable: false, api_name: "_version"
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
