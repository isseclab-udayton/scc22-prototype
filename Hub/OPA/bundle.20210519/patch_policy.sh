cd policies
curl -H "Content-Type: application/json" -X PUT --data-binary @test.rego 192.168.99.101:8181/v1/policies/test
curl 192.168.99.101:8181/v1/policies