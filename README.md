# TrueworkCLI

CLI for Truework API

Supports:

- Verifications API
  - List (with pagination)
  - Get
  - Create
  - Cancellation
  - Reverification
- Company Search

`$ trueworkcli` Interactive Mode  
`$ trueworkcli list TW_TOKEN=tw_sk_test_xxxxx`  
`$ trueworkcli get <verification_id>`  
`$ trueworkcli create --purpose employment -f Felix -l Sargent --ssn 111-111-1111 -c Truework --type employment`  

Default is staging. Use `--production` with `TW_TOKEN_PROD=tw_sk_xxxx` for production.

Demo Video:
[![Video](https://user-images.githubusercontent.com/273880/157930928-8cd04f86-a6c5-4040-ae48-7dd372be1e8b.png)](https://cln.sh/RNdOV6/)
