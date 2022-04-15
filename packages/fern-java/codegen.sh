# Generate fern ir
cd ../../ && yarn workspace fern run fern generate ../../fern-api fern-api-ir.json

# Download java codegen plugin and invoke
version=$1
wget --user "$JFROG_USERNAME" --password "$JFROG_API_KEY" \
  https://usebirch.jfrog.io/artifactory/default-maven-local/com/fern/java/fern-model-codegen/"$version"/fern-model-codegen-"$version".zip
unzip fern-model-codegen-"$version".zip
cd fern-model-codegen-"$version"-"$version"
java -cp fern-model-codegen-"$version".jar:lib/* com.fern.model.codegen.ModelGeneratorCli ../../api/src/fern.yml
