// https://javascript.plainenglish.io/how-to-test-a-node-js-command-line-tool-2735ea7dc041

// index.spec.js
test('help option', async () => {
  const program = createProgram()
  program.exitOverride().configureOutput({
    writeOut(str) {
      expect(str).toEqual(`Usage: trueworkcli [options] [command]

      CLI for Truework
      Define API key in .env or TW_TOKEN=<token>
      Default env is Staging. Use --production to use production
      
      Options:
        -v, --verbose                           Verbose output
        -p, --production                        Use production environment (env: TWCLI_PROD)
        -h, --help                              display help for command
      
      Commands:
        list [options]
        get <verification_id>
        create [options]                        Create Verification
        import <file>                           Import Verification
        company [options] <company_name>        Company queries
        cancel [options] <verification_id>      Cancel Verification
        reverify <verification_id> <report_id>  Reverify a Verification
`)
    },
  })
  try {
    // use 'parseAsync' for async callback hook
    await program.parseAsync(['node', 'index.js', '-h'])
  } catch (e) {
    // According to code
    // distinguish whether it is an error of the help command itself or other code errors
    if (e.code) {
      expect(e.code).toBe('commander.helpDisplayed')
    } else {
      throw e
    }
  }
})
