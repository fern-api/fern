# frozen_string_literal: true

module FernBasicAuth
  module Errors
    module Types
      class UnauthorizedRequestErrorBody < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
