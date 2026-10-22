# frozen_string_literal: true

module Seed
  module Types
    # RFC 9457 Problem Details returned for every error response.
    class ServiceErrorResponse < Internal::Types::Model
      field :type, -> { String }, optional: false, nullable: false

      field :title, -> { String }, optional: false, nullable: false

      field :status, -> { Integer }, optional: false, nullable: false

      field :detail, -> { String }, optional: true, nullable: false

      field :instance, -> { String }, optional: true, nullable: false

      field :code, -> { Integer }, optional: true, nullable: false

      field :errors, -> { Internal::Types::Array[Seed::Types::ServiceErrorResponseErrorsItem] }, optional: true, nullable: false
    end
  end
end
