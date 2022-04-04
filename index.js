#!/usr/bin/env node

require('dotenv').config()
const { Command, Option } = require('commander')
const { mainPrompt } = require('./inquirer')
const {
  createVerification,
  getCompany,
  getVerification,
  listVerifications,
  importFile,
  cancelVerification,
  reverifyVerification,
} = require('./twapi')
const program = new Command()

if (!process.env.TW_TOKEN) {
  console.error(
    'TW_TOKEN environment variable is not set\nPlease define one in .env or $ trueworkapi TW_TOKEN=<token>'
  )
  process.exit(1)
}

program
  .option('-v, --verbose', 'Verbose output')
  .addOption(
    new Option('--environment <environment>', 'Use environment').choices([
      'production',
      'local',
      'staging',
    ])
  )
  .description(
    'CLI for Truework\nDefine API key in .env or TW_TOKEN=<token>\nDefault env is Staging. Use --production to use production'
  )
  .option('-t, --trace', 'display trace statements for commands')
  .hook('preAction', (thisCommand, actionCommand) => {
    if (thisCommand.opts().trace) {
      console.log(
        `About to call action handler for subcommand: ${actionCommand.name()}`
      )
      console.log('arguments: %O', actionCommand.args)
      console.log('options: %o', actionCommand.opts())
    }
  })
  .hook('preAction', () => {
    if (!program.optsWithGlobals().environment) {
      program.setOptionValue('baseURL', 'https://api.truework-sandbox.com/')
    }
    if (program.optsWithGlobals().environment === 'local') {
      if (!process.env.TW_TOKEN_LOCAL) {
        console.error(
          'TW_TOKEN_LOCAL environment variable is not set\nPlease define one in .env or $ trueworkapi TW_TOKEN_LOCAL=<token>'
        )
        process.exit(1)
      }
      console.log('Using local environment')
      process.env.TW_TOKEN = process.env.TW_TOKEN_LOCAL
      program.setOptionValue('baseURL', 'http://localhost:8000/')
    }
    if (program.optsWithGlobals().environment === 'production') {
      if (!process.env.TW_TOKEN_PROD) {
        console.error(
          'TW_TOKEN_PROD environment variable is not set\nPlease define one in .env or $ trueworkapi TW_TOKEN_PROD=<token>'
        )
        process.exit(1)
      }
      process.env.TW_TOKEN = process.env.TW_TOKEN_PROD
      console.log('Using production environment')
      program.setOptionValue('baseURL', 'https://api.truework.com/')
    }
  })

program.action((options, cmd) => {
  mainPrompt(options, cmd)
})

// List Verifications
program
  .command('list')
  .addOption(
    new Option('-s, --state <state>').choices([
      'pending-approval',
      'action-required',
      'invalid',
      'processing',
      'completed',
      'canceled',
    ])
  )
  .option('-l, --limit <limit>', 'Limit the number of results', '10')
  .option('-o, --offset <offset>', 'Offset the results', '0')
  .action((options, cmd) => {
    listVerifications(options, cmd)
  })

// Get Verification
program
  .command('get')
  .argument('<verification_id>')
  .action(async (verification_id, options, cmd) => {
    if (verification_id.length !== 56) {
      console.error('Please enter a valid verification ID')
      process.exit(1)
    }

    await getVerification(verification_id, options, cmd)
  })

// Create Verifications
program
  .command('create')
  .description('Create Verification')
  .addOption(
    new Option('--type <type>', 'Request type')
      .choices(['employment-income', 'employment'])
      .default('employment')
  )
  .addOption(
    new Option(
      '--purpose <purpose>',
      'A valid purpose is required for Truework to process the verification request.'
    )
      .choices([
        'child-support',
        'credit-application',
        'employee-eligibility',
        'employee-request',
        'employee-review-or-collection',
        'employment',
        'insurance-underwriting-application',
        'legitimate-reason-initiated',
        'legitimate-reason-review',
        'risk-assessment',
        'subpoena',
      ])
      .default('credit-application')
  )
  .option('-s, --sync', 'Sync Verification (Instant Response)', true)
  .option('--instant', 'Instant Verification', true)
  .option(' --credentials', 'Credentials Verification')
  .option('--smart-outreach', 'Smart Outreach Verification')
  .requiredOption('-f, --first_name <first_name>', 'First Name')
  .requiredOption('-l, --last_name <last_name>', 'Last Name')
  .requiredOption('--ssn <ssn>', 'Social Security Number')
  .requiredOption('-c, --company <company>', 'Company Name')
  .option('--email [email]', 'Email')
  .option('--phone [phone]', 'Phone')
  .action((options, cmd) => {
    createVerification(options, cmd)
  })

program
  .command('import')
  .description('Import Verification')
  .arguments('<file>')
  .option('-s, --sync', 'Sync Verification (Instant Response)', true)
  .action((filePath, options, cmd) => {
    importFile(filePath, options, cmd)
  })

program
  .command('company')
  .description('Company queries')
  .argument('<company_name>')
  .option('-l, --limit', 'Limit the number of results', '25')
  .option('--offset')
  .action((company_name, options, cmd) => {
    getCompany(company_name, options, cmd)
  })

program
  .command('cancel')
  .description('Cancel Verification')
  .argument('<verification_id>')
  .option(
    '-m, --details [cancellation_details]',
    'Cancellation Details (-m for memo)'
  )
  .addOption(
    new Option(
      '-r, --reason <cancellation_reason>',
      'Cancellation Reason'
    ).choices([
      'immediate',
      'high-turnaround-time',
      'competitor',
      'wrong-info',
      'other',
    ])
  )
  .action((verification_id, options, cmd) => {
    cancelVerification(verification_id, options, cmd)
  })

program
  .command('reverify')
  .description('Reverify a Verification')
  .argument('<verification_id>')
  .argument('<report_id>')
  .action((verification_id, report_id, options, cmd) => {
    reverifyVerification(verification_id, report_id, options, cmd)
  })

program.parse()
