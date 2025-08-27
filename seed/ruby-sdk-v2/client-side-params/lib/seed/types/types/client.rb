# frozen_string_literal: true

module Seed
  module Types
    module Types
      # Represents a client application
      class Client < Internal::Types::Model
        field :client_id, -> { String }, optional: false, nullable: false
        field :tenant, -> { String }, optional: true, nullable: false
        field :name, -> { String }, optional: false, nullable: false
        field :description, -> { String }, optional: true, nullable: false
        field :global, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :client_secret, -> { String }, optional: true, nullable: false
        field :app_type, -> { String }, optional: true, nullable: false
        field :logo_uri, -> { String }, optional: true, nullable: false
        field :is_first_party, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :oidc_conformant, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :callbacks, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :allowed_origins, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :web_origins, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :grant_types, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :jwt_configuration, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :signing_keys, lambda {
          Internal::Types::Array[Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]]
        }, optional: true, nullable: false
        field :encryption_key, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :sso, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :sso_disabled, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :cross_origin_auth, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :cross_origin_loc, -> { String }, optional: true, nullable: false
        field :custom_login_page_on, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :custom_login_page, -> { String }, optional: true, nullable: false
        field :custom_login_page_preview, -> { String }, optional: true, nullable: false
        field :form_template, -> { String }, optional: true, nullable: false
        field :is_heroku_app, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :addons, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :token_endpoint_auth_method, -> { String }, optional: true, nullable: false
        field :client_metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :mobile, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
      end
    end
  end
end
