# frozen_string_literal: true

module Seed
  module Types
    module Types
      class Identity < Internal::Types::Model
        field :connection, -> { String }, optional: false, nullable: false
        field :user_id, -> { String }, optional: false, nullable: false
        field :provider, -> { String }, optional: false, nullable: false
        field :is_social, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :access_token, -> { String }, optional: true, nullable: false
        field :expires_in, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
