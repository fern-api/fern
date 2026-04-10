# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class AuthGetTokenWithClientCredentialsRequest < Internal::Types::Model
        field :cid, -> { String }, optional: false, nullable: false
        field :csr, -> { String }, optional: false, nullable: false
        field :scp, -> { String }, optional: false, nullable: false
        field :entity_id, -> { String }, optional: false, nullable: false
        field :audience, -> { Seed::Auth::Types::AuthGetTokenWithClientCredentialsRequestAudience }, optional: false, nullable: false
        field :grant_type, -> { Seed::Auth::Types::AuthGetTokenWithClientCredentialsRequestGrantType }, optional: false, nullable: false
        field :scope, -> { String }, optional: true, nullable: false
      end
    end
  end
end
