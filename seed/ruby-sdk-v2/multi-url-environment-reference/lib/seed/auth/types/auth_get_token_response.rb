# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Auth
    module Types
      class AuthGetTokenResponse < Internal::Types::Model
        field :access_token, -> { String }, optional: false, nullable: false
      end
    end
  end
end
