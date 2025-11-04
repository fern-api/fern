# frozen_string_literal: true

module Seed
  module Service
    module Types
      class PatchComplexRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :name, -> { String }, optional: true, nullable: false
        field :age, -> { Integer }, optional: true, nullable: false
        field :active, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :tags, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :email, -> { String }, optional: true, nullable: false
        field :nickname, -> { String }, optional: true, nullable: false
        field :bio, -> { String }, optional: true, nullable: false
        field :profile_image_url, -> { String }, optional: true, nullable: false, api_name: "profileImageUrl"
        field :settings, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
      end
    end
  end
end
