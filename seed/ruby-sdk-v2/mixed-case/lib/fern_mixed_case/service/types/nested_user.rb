# frozen_string_literal: true

module FernMixedCase
  module Service
    module Types
      class NestedUser < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false, api_name: "Name"
        field :nested_user, -> { FernMixedCase::Service::Types::User }, optional: false, nullable: false, api_name: "NestedUser"
      end
    end
  end
end
