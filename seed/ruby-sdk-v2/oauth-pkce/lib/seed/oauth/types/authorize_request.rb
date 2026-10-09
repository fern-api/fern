# frozen_string_literal: true

module Seed
  module Oauth
    module Types
      class AuthorizeRequest < Internal::Types::Model
        field :response_type, -> { String }, optional: false, nullable: false

        field :client_id, -> { String }, optional: false, nullable: false

        field :redirect_uri, -> { String }, optional: false, nullable: false

        field :code_challenge, -> { String }, optional: false, nullable: false

        field :code_challenge_method, -> { String }, optional: true, nullable: false

        field :scope, -> { String }, optional: true, nullable: false

        field :state, -> { String }, optional: true, nullable: false
      end
    end
  end
end
