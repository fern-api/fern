# frozen_string_literal: true

module SeedMultiUrlEnvironmentClient
  class Environment
    PRODUCTION = { ec2: "https://ec2.aws.com", s3: "https://s3.aws.com" }.freeze
    STAGING = { ec2: "https://staging.ec2.aws.com", s3: "https://staging.s3.aws.com" }.freeze
  end
end
