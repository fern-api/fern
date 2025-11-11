# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class Metadata < Internal::Types::Model
        field :created_at, -> { String }, optional: false, nullable: false, api_name: "createdAt"
        field :updated_at, -> { String }, optional: false, nullable: false, api_name: "updatedAt"
        field :avatar, -> { String }, optional: false, nullable: true
        field :activated, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :status, -> { Seed::Nullable::Types::Status }, optional: false, nullable: false
        field :values, -> { Internal::Types::Hash[String, String] }, optional: true, nullable: false
      end
    end
  end
end
