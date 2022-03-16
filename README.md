# TrueworkCLI

Hackday project to make a CLI for Truework

Supports:

- Verifications API
  - List
  - Get
  - Create
- Company Search

`$ trueworkcli list TW_TOKEN=tw_sk_test_xxxxx`
`$ trueworkcli get <verification_id>`
`$ trueworkcli create --purpose employment -f Felix -l Sargent --ssn 111-111-1111 -c Truework --type employment`  
`$ trueworkcli` Interactive Mode

Default is staging. Use `--production` with `TW_TOKEN_PROD=tw_sk_xxxx` for production.

TODO:

- Cancel/Reverify
- Pagination

[![Video](https://user-images.githubusercontent.com/273880/157930928-8cd04f86-a6c5-4040-ae48-7dd372be1e8b.png)](https://cln.sh/RNdOV6/)
