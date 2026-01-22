# frozen_string_literal: true

module FernTrace
  module Migration
    module Types
      class GetAttemptedMigrationsRequest < Internal::Types::Model
        field :admin_key_header, -> { String }, optional: false, nullable: false, api_name: "admin-key-header"
      end
    end
  end
end
