# frozen_string_literal: true

module Seed
  module Service
    module Types
      class NestedUser < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false, api_name: "Name"
        field :nested_user, -> { Seed::Service::Types::User }, optional: false, nullable: false, api_name: "NestedUser"
      end
    end
  end
end
