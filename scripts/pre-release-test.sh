npm install -g fern-api@next
mkdir pre-release-test
cd pre-release-test
fern init --organization fern
fern add java
fern add typescript
fern add postman
fern generate > generate.out
if grep -q ❌ "$File"; then
  exit 1;
fi
rm -rf pre-release-test